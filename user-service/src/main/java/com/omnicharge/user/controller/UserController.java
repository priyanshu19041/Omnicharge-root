package com.omnicharge.user.controller;

import com.omnicharge.user.entity.User;
import com.omnicharge.user.service.UserService;
import com.omnicharge.user.dto.AuthResponse;
import com.omnicharge.user.dto.LoginRequest;
import lombok.RequiredArgsConstructor;
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
    
    @GetMapping
    public List<User> getAll() {
        return userService.getAllUsers();
    }
    
    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
