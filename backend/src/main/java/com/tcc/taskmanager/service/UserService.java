package com.tcc.taskmanager.service;

import com.tcc.taskmanager.model.User;
import com.tcc.taskmanager.model.dto.UserProfileDto;
import com.tcc.taskmanager.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserProfileDto getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return convertToProfileDto(user);
    }

    public UserProfileDto updateProfile(String currentUsername, UserProfileDto profileDto) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar si el nuevo username ya existe en otro usuario
        if (!user.getUsername().equals(profileDto.getUsername())) {
            if (userRepository.existsByUsername(profileDto.getUsername())) {
                throw new RuntimeException("El nombre de usuario ya está en uso");
            }
            user.setUsername(profileDto.getUsername());
        }

        // Validar si el nuevo email ya existe en otro usuario
        if (!user.getEmail().equals(profileDto.getEmail())) {
            if (userRepository.existsByEmail(profileDto.getEmail())) {
                throw new RuntimeException("El correo electrónico ya está en uso");
            }
            user.setEmail(profileDto.getEmail());
        }

        user.setFirstName(profileDto.getFirstName());
        user.setLastName(profileDto.getLastName());
        user.setPhone(profileDto.getPhone());

        User updatedUser = userRepository.save(user);
        return convertToProfileDto(updatedUser);
    }

    public User updateUserAndReturnEntity(String username, UserProfileDto profileDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar username único si cambió
        if (!user.getUsername().equals(profileDto.getUsername())) {
            if (userRepository.existsByUsername(profileDto.getUsername())) {
                throw new RuntimeException("El nombre de usuario ya está en uso");
            }
            user.setUsername(profileDto.getUsername());
        }

        // Validar email único si cambió  
        if (!user.getEmail().equals(profileDto.getEmail())) {
            if (userRepository.existsByEmail(profileDto.getEmail())) {
                throw new RuntimeException("El correo electrónico ya está en uso");
            }
            user.setEmail(profileDto.getEmail());
        }

        // Actualizar campos
        user.setFirstName(profileDto.getFirstName());
        user.setLastName(profileDto.getLastName());
        if (profileDto.getPhone() != null) {
            user.setPhone(profileDto.getPhone());
        }
        
        User savedUser = userRepository.save(user);
        return savedUser;
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Contraseña actual incorrecta");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserProfileDto convertToProfileDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setFullName(user.getFullName());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}