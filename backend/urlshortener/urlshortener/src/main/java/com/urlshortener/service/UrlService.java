package com.urlshortener.service;

import com.urlshortener.model.Url;
import com.urlshortener.model.UrlClick;
import com.urlshortener.repository.UrlRepository;
import com.urlshortener.repository.UrlClickRepository;
import com.urlshortener.util.Base62Encoder;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UrlService {

    private final UrlRepository urlRepository;
    private final UrlClickRepository urlClickRepository;

    public UrlService(UrlRepository urlRepository,
                      UrlClickRepository urlClickRepository) {
        this.urlRepository = urlRepository;
        this.urlClickRepository = urlClickRepository;
    }

    public String shortenUrl(String longUrl) {

        // URL validation
        if (!longUrl.startsWith("http://") && !longUrl.startsWith("https://")) {
            throw new RuntimeException("Invalid URL format");
        }

        Url url = new Url();
        url.setLongUrl(longUrl);
        url.setCreatedAt(LocalDateTime.now());

        // Save first to generate database ID
        url = urlRepository.save(url);

        // Convert ID to Base62
        String shortCode = Base62Encoder.encode(url.getId());

        // Update entity with short code
        url.setShortCode(shortCode);

        urlRepository.save(url);

        return shortCode;
    }

    public String getLongUrl(String shortCode, HttpServletRequest request) {

        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("URL not found"));

        // Save click analytics
        UrlClick click = new UrlClick();
        click.setShortCode(shortCode);
        click.setIpAddress(request.getRemoteAddr());
        click.setClickedAt(LocalDateTime.now());

        urlClickRepository.save(click);

        return url.getLongUrl();
    }
}