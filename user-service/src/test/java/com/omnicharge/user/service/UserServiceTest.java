package com.omnicharge.user.service;

import com.omnicharge.user.dto.AuthResponse;
import com.omnicharge.user.dto.LoginRequest;
import com.omnicharge.user.entity.User;
import com.omnicharge.user.repository.UserRepository;
import com.omnicharge.user.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User dummyUser;

    @BeforeEach
    void setUp() {
        dummyUser = new User();
        dummyUser.setId(1L);
        dummyUser.setUsername("testuser");
        dummyUser.setPassword("encodedPassword");
        dummyUser.setPhoneNumber("1234567890");
    }

    @Test
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        when(userRepository.findFirstByUsername("testuser")).thenReturn(Optional.of(dummyUser));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("testuser", "USER")).thenReturn("dummy-jwt-token");

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals("dummy-jwt-token", response.getToken());
        verify(userRepository).findFirstByUsername("testuser");
        verify(passwordEncoder).matches("password", "encodedPassword");
        verify(jwtUtil).generateToken("testuser", "USER");
    }

    @Test
    void shouldThrowExceptionWhenLoginUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setUsername("unknownuser");
        request.setPassword("password");

        when(userRepository.findFirstByUsername("unknownuser")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("User not found", exception.getMessage());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void shouldThrowExceptionWhenLoginPasswordInvalid() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");

        when(userRepository.findFirstByUsername("testuser")).thenReturn(Optional.of(dummyUser));
        when(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.login(request));
        assertEquals("Invalid credentials", exception.getMessage());
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setPassword("rawpassword");

        User savedUser = new User();
        savedUser.setId(2L);
        savedUser.setUsername("newuser");
        savedUser.setPassword("newEncodedPassword");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(passwordEncoder.encode("rawpassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = userService.registerUser(newUser);

        assertNotNull(result);
        assertEquals(2L, result.getId());
        assertEquals("newEncodedPassword", result.getPassword());
        verify(passwordEncoder).encode("rawpassword");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenRegisterUserDuplicateUsername() {
        User newUser = new User();
        newUser.setUsername("existinguser");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.registerUser(newUser));
        assertEquals("Username already exists. Please choose a different username.", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldGetAllUsers() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(dummyUser));

        List<User> users = userService.getAllUsers();

        assertNotNull(users);
        assertEquals(1, users.size());
        assertEquals("testuser", users.get(0).getUsername());
        verify(userRepository).findAll();
    }

    @Test
    void shouldGetUserByIdSuccessfully() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(dummyUser));

        User user = userService.getUserById(1L);

        assertNotNull(user);
        assertEquals(1L, user.getId());
        assertEquals("testuser", user.getUsername());
        verify(userRepository).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenUserByIdNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.getUserById(99L));
        assertEquals("User not found", exception.getMessage());
    }
}
