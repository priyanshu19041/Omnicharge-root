package com.omnicharge.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;

@Component
public class AdminAuthFilter implements GlobalFilter, Ordered {

    // Same secret as in user-service JwtUtil
    private final String secret = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Only protect /api/v1/admin/** endpoints
        if (path.contains("/api/v1/admin/")) {
            if (!request.getHeaders().containsKey("Authorization")) {
                return this.onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getOrEmpty("Authorization").get(0);
            if (!authHeader.startsWith("Bearer ")) {
                return this.onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(getSignKey())
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
                
                String role = claims.get("role", String.class);
                if (!"ADMIN".equals(role)) {
                    return this.onError(exchange, "Forbidden: Admin access required", HttpStatus.FORBIDDEN);
                }

                // If valid, pass the request along
                return chain.filter(exchange);

            } catch (Exception e) {
                return this.onError(exchange, "Invalid JWT token", HttpStatus.UNAUTHORIZED);
            }
        }

        // Proceed without filtering for non-admin endpoints
        return chain.filter(exchange);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        // We can optionally write the error body, but for a Gateway Filter, setting the status code is usually enough.
        return response.setComplete();
    }

    private SecretKey getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public int getOrder() {
        return -1; // Execute before routing
    }
}
