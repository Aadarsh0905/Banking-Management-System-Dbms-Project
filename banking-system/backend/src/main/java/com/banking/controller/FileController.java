package com.banking.controller;

import com.banking.entity.UserAvatar;
import com.banking.repository.UserAvatarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final UserAvatarRepository userAvatarRepo;

    @Value("${banking.upload.dir:./uploads}")
    private String uploadDir;

    @GetMapping({"/uploads/avatars/{filename:.+}", "/uploads/{filename:.+}"})
    public ResponseEntity<Resource> serveAvatarFile(@PathVariable String filename) {
        try {
            // 1. Try local disk cache in avatars/ directory
            Path filePath = Paths.get(uploadDir, "avatars", filename).normalize();
            if (Files.exists(filePath) && Files.isReadable(filePath)) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = detectMimeType(filename);
                }
                return ResponseEntity.ok()
                        .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(new UrlResource(filePath.toUri()));
            }

            // 1b. Try root uploads/ directory
            Path rootPath = Paths.get(uploadDir, filename).normalize();
            if (Files.exists(rootPath) && Files.isReadable(rootPath)) {
                String contentType = Files.probeContentType(rootPath);
                if (contentType == null) {
                    contentType = detectMimeType(filename);
                }
                return ResponseEntity.ok()
                        .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(new UrlResource(rootPath.toUri()));
            }

            // 2. Fallback to Cloud Database (survives Render container reboots)
            Optional<UserAvatar> optAvatar = userAvatarRepo.findByFilename(filename);
            if (optAvatar.isEmpty() && filename.startsWith("avatar_")) {
                String[] parts = filename.split("_");
                if (parts.length >= 2) {
                    try {
                        Long uId = Long.parseLong(parts[1]);
                        optAvatar = userAvatarRepo.findByUserId(uId);
                    } catch (NumberFormatException ignored) {}
                }
            }

            if (optAvatar.isPresent()) {
                UserAvatar avatar = optAvatar.get();
                byte[] data = avatar.getData();
                if (data != null && data.length > 0) {
                    // Restore to disk cache for future fast reads
                    try {
                        Path dir = Paths.get(uploadDir, "avatars");
                        Files.createDirectories(dir);
                        Files.write(dir.resolve(filename), data, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                    } catch (Exception e) {
                        log.warn("Could not populate disk cache for {}: {}", filename, e.getMessage());
                    }

                    String mime = avatar.getContentType();
                    if (mime == null || mime.isBlank()) {
                        mime = detectMimeType(filename);
                    }

                    return ResponseEntity.ok()
                            .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                            .contentType(MediaType.parseMediaType(mime))
                            .body(new ByteArrayResource(data));
                }
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error serving avatar file {}: {}", filename, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    private String detectMimeType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        return "image/jpeg";
    }
}
