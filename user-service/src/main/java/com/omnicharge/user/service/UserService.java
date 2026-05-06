package com.omnicharge.user.service;

import com.omnicharge.user.entity.User;
import com.omnicharge.user.repository.UserRepository;
import com.omnicharge.user.dto.AuthResponse;
import com.omnicharge.user.dto.LoginRequest;
import com.omnicharge.user.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findFirstByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String role = user.getRole() != null ? user.getRole() : "USER";
        String token = jwtUtil.generateToken(user.getUsername(), role);
        return new AuthResponse(token, user.getId(), user.getUsername(), role);
    }

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists. Please choose a different username.");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByUsername(String username) {
        return userRepository.findFirstByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long id, User updated) {
        User existing = getUserById(id);
        if (updated.getEmail() != null)       existing.setEmail(updated.getEmail());
        if (updated.getPhoneNumber() != null)  existing.setPhoneNumber(updated.getPhoneNumber());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updated.getPassword()));
        }
        return userRepository.save(existing);
    }

    public void deleteUser(Long id) {
        getUserById(id); // throws if not found
        userRepository.deleteById(id);
    }
}
