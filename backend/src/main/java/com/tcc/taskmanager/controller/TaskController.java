package com.tcc.taskmanager.controller;

import com.tcc.taskmanager.model.dto.TaskDto;
import com.tcc.taskmanager.model.dto.TaskStatsDto;
import com.tcc.taskmanager.model.TaskStatus;
import com.tcc.taskmanager.model.Priority;
import com.tcc.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // ✅ ENDPOINTS ESPECÍFICOS PRIMERO
    @GetMapping("/my")
    public ResponseEntity<List<TaskDto>> getMyTasks(Authentication authentication) {
        List<TaskDto> tasks = taskService.getUserTasks(authentication.getName());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/stats")
    public ResponseEntity<TaskStatsDto> getMyTaskStats(Authentication authentication) {
        TaskStatsDto stats = taskService.getUserTaskStats(authentication.getName());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskDto>> getTasksByStatus(@PathVariable TaskStatus status,
            Authentication authentication) {
        List<TaskDto> tasks = taskService.getUserTasksByStatus(authentication.getName(), status);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TaskDto>> getTasksByPriority(@PathVariable Priority priority,
            Authentication authentication) {
        List<TaskDto> tasks = taskService.getUserTasksByPriority(authentication.getName(), priority);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TaskDto>> searchTasks(@RequestParam String query,
            Authentication authentication) {
        List<TaskDto> tasks = taskService.searchUserTasks(authentication.getName(), query);
        return ResponseEntity.ok(tasks);
    }

    // ✅ ENDPOINT GENÉRICO AL FINAL
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id, Authentication authentication) {
        TaskDto task = taskService.getTaskById(id, authentication.getName());
        return ResponseEntity.ok(task);
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllMyTasks(Authentication authentication) {
        List<TaskDto> tasks = taskService.getUserTasks(authentication.getName());
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto,
            Authentication authentication) {
        TaskDto createdTask = taskService.createTask(taskDto, authentication.getName());
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id,
            @Valid @RequestBody TaskDto taskDto,
            Authentication authentication) {
        TaskDto updatedTask = taskService.updateTask(id, taskDto, authentication.getName());
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Authentication authentication) {
        taskService.deleteTask(id, authentication.getName());
        return ResponseEntity.noContent().build(); 
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable Long id,
            @RequestParam TaskStatus status,
            Authentication authentication) {
        TaskDto updatedTask = taskService.updateTaskStatus(id, status, authentication.getName());
        return ResponseEntity.ok(updatedTask);
    }
}