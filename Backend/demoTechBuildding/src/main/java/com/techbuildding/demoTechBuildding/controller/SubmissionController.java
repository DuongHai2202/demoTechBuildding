package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.request.submission.SubmissionProcessRequestDTO;
import com.techbuildding.demoTechBuildding.dto.request.submission.SubmissionRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.submission.SubmissionResponseDTO;
import com.techbuildding.demoTechBuildding.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
@Tag(name = "Submission API", description = "Quản lý quy trình đệ trình và phê duyệt")
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    @Operation(summary = "Khởi tạo luồng đệ trình mới")
    public ResponseData<?> createSubmission(@RequestBody SubmissionRequestDTO request) {
        return new ResponseData<>(HttpStatus.CREATED.value(), "Submission created", 
                submissionService.createSubmission(request));
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả các đệ trình")
    public ResponseData<List<SubmissionResponseDTO>> getAllSubmissions() {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", submissionService.getAllSubmissions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin đệ trình theo ID")
    public ResponseData<?> getSubmission(@PathVariable Long id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", 
                submissionService.getSubmission(id));
    }

    @PatchMapping("/{submissionId}/steps/{stepId}")
    @Operation(summary = "Xử lý bước phê duyệt (Approve/Reject/Sign)")
    public ResponseData<?> processStep(
            @PathVariable Long submissionId,
            @PathVariable Long stepId,
            @RequestBody SubmissionProcessRequestDTO request) {
        return new ResponseData<>(HttpStatus.OK.value(), "Step processed", 
                submissionService.processStep(submissionId, stepId, request));
    }

    @GetMapping("/reference/{type}/{id}")
    @Operation(summary = "Lấy đệ trình theo entity tham chiếu")
    public ResponseData<?> getByReference(
            @PathVariable String type,
            @PathVariable Long id) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", 
                submissionService.getSubmissionByReference(type, id));
    }

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Danh sách đệ trình của dự án")
    public ResponseData<?> getProjectSubmissions(@PathVariable Integer projectId) {
        return new ResponseData<>(HttpStatus.OK.value(), "Success", 
                submissionService.getProjectSubmissions(projectId));
    }
}
