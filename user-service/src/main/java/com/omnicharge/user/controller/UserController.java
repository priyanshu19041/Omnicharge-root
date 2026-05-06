package com.omnicharge.user.controller;

import com.omnicharge.user.entity.User;
import com.omnicharge.user.service.UserService;
import com.omnicharge.user.dto.AuthResponse;
import com.omnicharge.user.dto.LoginRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/setup-admin")
    public ResponseEntity<String> setupAdmin(@RequestParam String username) {
        User user = userService.getUserByUsername(username);
        user.setRole("ADMIN");
        userService.updateUser(user.getId(), user);
        return ResponseEntity.ok("User promoted to ADMIN. Please log in again to receive your admin token.");
    }

    @GetMapping
    public List<User> getAll() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // GET /api/v1/users/me?username=john — resolve logged-in user from JWT subject
    @GetMapping("/me")
    public User getByUsername(@RequestParam String username) {
        return userService.getUserByUsername(username);
    }

    // PUT /api/v1/users/{id} — update email, phone, or password
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    // DELETE /api/v1/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}

