package com.banking.controller;

import com.banking.entity.User;
import com.banking.entity.UserAvatar;
import com.banking.repository.UserAvatarRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileController {

    private final UserAvatarRepository userAvatarRepo;
    private final UserRepository userRepo;

    @Value("${banking.upload.dir:./uploads}")
    private String uploadDir;

    @GetMapping({
        "/uploads/avatars/{filename:.+}",
        "/uploads/{filename:.+}",
        "/api/uploads/avatars/{filename:.+}",
        "/api/uploads/{filename:.+}"
    })
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

            // 2. Extract potential userId from filename (handles avatar_123_... and 123_...)
            Long uId = extractUserId(filename);

            // 3. Fallback to Cloud Database (survives Render container reboots)
            Optional<UserAvatar> optAvatar = userAvatarRepo.findByFilename(filename);
            if (optAvatar.isEmpty() && uId != null) {
                optAvatar = userAvatarRepo.findByUserId(uId);
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

            // 4. If image file is missing (e.g. wiped before DB persistence was enabled),
            // generate dynamic branded SVG avatar with user's initials so avatar never breaks
            String initials = "BP";
            if (uId != null) {
                Optional<User> optUser = userRepo.findById(uId);
                if (optUser.isPresent()) {
                    User u = optUser.get();
                    String first = (u.getFirstName() != null && !u.getFirstName().isBlank()) ? u.getFirstName().substring(0, 1).toUpperCase() : "";
                    String last = (u.getLastName() != null && !u.getLastName().isBlank()) ? u.getLastName().substring(0, 1).toUpperCase() : "";
                    initials = (first + last).isBlank() ? "U" : (first + last);
                }
            }

            String svg = generateInitialsSvg(initials);
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.noCache())
                    .contentType(MediaType.parseMediaType("image/svg+xml;charset=UTF-8"))
                    .body(new ByteArrayResource(svg.getBytes(StandardCharsets.UTF_8)));

        } catch (Exception e) {
            log.error("Error serving avatar file {}: {}", filename, e.getMessage());
            String fallbackSvg = generateInitialsSvg("BP");
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("image/svg+xml;charset=UTF-8"))
                    .body(new ByteArrayResource(fallbackSvg.getBytes(StandardCharsets.UTF_8)));
        }
    }

    private Long extractUserId(String filename) {
        try {
            if (filename.startsWith("avatar_")) {
                String[] parts = filename.split("_");
                if (parts.length >= 2) return Long.parseLong(parts[1]);
            }
            int underscoreIdx = filename.indexOf('_');
            if (underscoreIdx > 0) {
                return Long.parseLong(filename.substring(0, underscoreIdx));
            }
        } catch (Exception ignored) {}
        return null;
    }

    private String generateInitialsSvg(String initials) {
        return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\" viewBox=\"0 0 200 200\">" +
                "<defs>" +
                "<linearGradient id=\"bgGrad\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">" +
                "<stop offset=\"0%\" stop-color=\"#ea580c\"/>" +
                "<stop offset=\"50%\" stop-color=\"#f97316\"/>" +
                "<stop offset=\"100%\" stop-color=\"#f59e0b\"/>" +
                "</linearGradient>" +
                "</defs>" +
                "<circle cx=\"100\" cy=\"100\" r=\"100\" fill=\"url(#bgGrad)\"/>" +
                "<text x=\"50%\" y=\"54%\" font-size=\"76\" font-family=\"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif\" font-weight=\"bold\" fill=\"#ffffff\" dominant-baseline=\"middle\" text-anchor=\"middle\">" +
                initials +
                "</text>" +
                "</svg>";
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
