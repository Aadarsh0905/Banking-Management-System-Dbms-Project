package com.banking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableCaching
public class BankingManagementSystemApplication {
    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(BankingManagementSystemApplication.class, args);
    }

    private static void loadEnvFile() {
        String[] paths = {
            ".env",
            "../.env",
            "../../.env",
            "./banking-system/.env",
            "../banking-system/.env"
        };
        File envFile = null;
        for (String p : paths) {
            File f = new File(p);
            if (f.exists() && f.isFile()) {
                envFile = f;
                break;
            }
        }

        if (envFile != null) {
            System.out.println("Loading environment variables from: " + envFile.getAbsolutePath());
            try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        // strip quotes if present
                        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }
                        if (System.getenv(key) == null && System.getProperty(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Could not load .env file: " + e.getMessage());
            }
        } else {
            System.out.println("System environment configuration active (no local .env file).");
        }
    }
}

@Component
class MailConfigLogger implements CommandLineRunner {
    @Value("${spring.mail.host}") private String host;
    @Value("${spring.mail.port}") private int port;
    @Value("${spring.mail.username}") private String username;
    @Value("${spring.profiles.active:dev}") private String activeProfile;

    @Override
    public void run(String... args) {
        System.out.println("\n==================================================================");
        System.out.println("ACTIVE PROFILE: " + activeProfile);
        System.out.println("SMTP CONFIGURATION ACTIVE:");
        System.out.println("  SMTP Host:     " + host);
        System.out.println("  SMTP Port:     " + port);
        System.out.println("  SMTP Username: " + username);
        System.out.println("==================================================================\n");
    }
}
