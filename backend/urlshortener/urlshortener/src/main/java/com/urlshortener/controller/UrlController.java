package com.urlshortener.controller;

import com.urlshortener.service.UrlService;
import com.urlshortener.repository.UrlClickRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class UrlController {

    private final UrlService urlService;
    private final UrlClickRepository urlClickRepository;

    public UrlController(UrlService urlService,
                         UrlClickRepository urlClickRepository) {
        this.urlService = urlService;
        this.urlClickRepository = urlClickRepository;
    }

    // Create short URL
    @PostMapping("/api/shorten")
    public Map<String, String> shortenUrl(@RequestBody Map<String, String> request) {

        String longUrl = request.get("url");

        String shortCode = urlService.shortenUrl(longUrl);

        return Map.of(
                "shortUrl", "http://localhost:8080/" + shortCode
        );
    }

    // Redirect short URL
    @GetMapping("/{code}")
    public ResponseEntity<?> redirect(@PathVariable String code,
                                      HttpServletRequest request) {

        try {

            String longUrl = urlService.getLongUrl(code, request);

            return ResponseEntity
                    .status(302)
                    .location(URI.create(longUrl))
                    .build();

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(404)
                    .body("Short URL not found");

        }
    }

    // Analytics API
    @GetMapping("/analytics/{code}")
    public Map<String, Long> getAnalytics(@PathVariable String code) {

        long clicks = urlClickRepository.countByShortCode(code);

        return Map.of("clicks", clicks);
    }
}