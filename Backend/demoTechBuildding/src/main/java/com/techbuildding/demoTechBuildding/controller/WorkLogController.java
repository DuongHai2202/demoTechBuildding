package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.worklog.WorkLogRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.worklog.WorkLogResponseDTO;
import com.techbuildding.demoTechBuildding.service.WorkLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/work-logs")
@RequiredArgsConstructor
@Tag(name = "Work log controller", description = "Field logs and media management")
public class WorkLogController {

    private final WorkLogService workLogService;

    @Operation(summary = "Create work log with media")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<WorkLogResponseDTO> createLog(
            @RequestPart("data") WorkLogRequestDTO request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Success", workLogService.createLog(request, files));
    }

    @Operation(summary = "Get all work logs")
    @GetMapping
    public ResponseData<List<WorkLogResponseDTO>> getAll() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", workLogService.getAllLogs());
    }

    @Operation(summary = "Get work logs by project")
    @GetMapping("/project/{projectId}")
    public ResponseData<List<WorkLogResponseDTO>> getByProject(@PathVariable("projectId") Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", workLogService.getLogsByProject(projectId));
    }

    @Operation(summary = "Delete work log")
    @DeleteMapping("/{logId}")
    public ResponseData<Void> delete(@PathVariable("logId") Long logId) {
        workLogService.deleteLog(logId);
        return new ResponseData<>(HttpStatus.OK.value(), "Deleted");
    }

    @Operation(summary = "Technical Check (QS/Technical)")
    @PatchMapping("/{id}/check")
    public ResponseData<WorkLogResponseDTO> check(@PathVariable("id") Long id, 
                                                 @RequestParam("userId") Long userId,
                                                 @RequestParam(value = "notes", required = false) String notes) {
        return new ResponseData<>(HttpStatus.OK.value(), "Checked", workLogService.checkLog(id, userId, notes));
    }

    @Operation(summary = "Manager Approve (PM)")
    @PatchMapping("/{id}/approve")
    public ResponseData<WorkLogResponseDTO> approve(@PathVariable("id") Long id, 
                                                   @RequestParam("userId") Long userId,
                                                   @RequestParam(value = "notes", required = false) String notes) {
        return new ResponseData<>(HttpStatus.OK.value(), "Approved", workLogService.approveLog(id, userId, notes));
    }

    @Operation(summary = "Reject work log")
    @PatchMapping("/{id}/reject")
    public ResponseData<WorkLogResponseDTO> reject(@PathVariable("id") Long id, 
                                                  @RequestParam("userId") Long userId,
                                                  @RequestParam(value = "notes", required = false) String notes) {
        return new ResponseData<>(HttpStatus.OK.value(), "Rejected", workLogService.rejectLog(id, userId, notes));
    }
}
