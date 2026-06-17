package com.banking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

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
