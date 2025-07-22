package com.tcc.taskmanager.controller;

import com.tcc.taskmanager.model.User;
import com.tcc.taskmanager.model.dto.UserProfileDto;
import com.tcc.taskmanager.model.dto.ChangePasswordDto;
import com.tcc.taskmanager.service.UserService;
import com.tcc.taskmanager.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        UserProfileDto profile = userService.getUserProfile(authentication.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserProfileDto profileDto,
            Authentication authentication) {
        User updatedUser = userService.updateUserAndReturnEntity(authentication.getName(), profileDto);
        String newToken = jwtService.generateToken(updatedUser);

        // Construir el DTO manualmente
        UserProfileDto updatedProfile = new UserProfileDto();
        updatedProfile.setId(updatedUser.getId());
        updatedProfile.setUsername(updatedUser.getUsername());
        updatedProfile.setEmail(updatedUser.getEmail());
        updatedProfile.setFirstName(updatedUser.getFirstName());
        updatedProfile.setLastName(updatedUser.getLastName());
        updatedProfile.setPhone(updatedUser.getPhone());
        updatedProfile.setFullName(updatedUser.getFirstName() + " " + updatedUser.getLastName());
        updatedProfile.setCreatedAt(updatedUser.getCreatedAt());

        Map<String, Object> response = new HashMap<>();
        response.put("user", updatedProfile);
        response.put("token", newToken);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordDto changePasswordDto,
            Authentication authentication) {
        userService.changePassword(authentication.getName(),
                changePasswordDto.getOldPassword(),
                changePasswordDto.getNewPassword());

        // ✅ CAMBIO: Devolver un JSON en lugar de un String
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Contraseña cambiada exitosamente");
        response.put("success", true);

        return ResponseEntity.ok(response);
    }
}
