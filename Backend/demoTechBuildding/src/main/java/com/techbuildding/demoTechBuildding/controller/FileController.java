package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller for file upload/delete operations using MinIO storage.
 *
 * Supported folders:
 * - "avatars" → User profile pictures
 * - "attendance" → Check-in selfie photos
 * - "documents" → Project documents
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "File controller", description = "APIs for file upload and delete")
public class FileController {

    private final StorageService storageService;

    /**
     * POST /api/v1/files/upload - Upload a single file
     */
    @Operation(summary = "Upload a file", description = "Upload a single file to MinIO. Returns the public URL of the uploaded file.")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<String> uploadFile(
            @Parameter(description = "File to upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Target folder: avatars, attendance, documents", example = "avatars") @RequestParam(value = "folder", defaultValue = "general") String folder) {

        log.info("Upload request: file={}, folder={}, size={} bytes",
                file.getOriginalFilename(), folder, file.getSize());

        // Validate file
        validateFile(file);

        String fileUrl = storageService.uploadFile(file, folder);
        return new ResponseData<>(HttpStatus.CREATED.value(), "File uploaded successfully", fileUrl);
    }

    /**
     * POST /api/v1/files/upload-multiple - Upload multiple files
     */
    @Operation(summary = "Upload multiple files", description = "Upload multiple files at once. Returns list of public URLs.")
    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseData<List<String>> uploadMultipleFiles(
            @Parameter(description = "Files to upload") @RequestParam("files") MultipartFile[] files,
            @Parameter(description = "Target folder", example = "documents") @RequestParam(value = "folder", defaultValue = "general") String folder) {

        log.info("Upload multiple files request: count={}, folder={}", files.length, folder);

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            validateFile(file);
            urls.add(storageService.uploadFile(file, folder));
        }

        return new ResponseData<>(HttpStatus.CREATED.value(), files.length + " files uploaded successfully", urls);
    }

    /**
     * DELETE /api/v1/files - Delete a file
     */
    @Operation(summary = "Delete a file", description = "Delete a file from MinIO storage by folder and filename.")
    @DeleteMapping
    public ResponseData<Void> deleteFile(
            @Parameter(description = "Folder of the file", example = "avatars") @RequestParam("folder") String folder,
            @Parameter(description = "Filename to delete", example = "uuid-photo.jpg") @RequestParam("filename") String filename) {

        log.info("Delete file request: folder={}, filename={}", folder, filename);

        storageService.deleteFile(folder, filename);
        return new ResponseData<>(HttpStatus.OK.value(), "File deleted successfully");
    }

    /**
     * GET /api/v1/files/download - Download a file
     */
    @Operation(summary = "Download a file", description = "Download a file from MinIO storage by folder and filename.")
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(
            @Parameter(description = "Folder of the file", example = "avatars") @RequestParam("folder") String folder,
            @Parameter(description = "Filename to download", example = "uuid-photo.jpg") @RequestParam("filename") String filename) {

        log.info("Download file request: folder={}, filename={}", folder, filename);

        byte[] data = storageService.downloadFile(folder, filename);

        // Determine content type from extension
        String contentType = "application/octet-stream";
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
            contentType = "image/jpeg";
        else if (filename.endsWith(".png"))
            contentType = "image/png";
        else if (filename.endsWith(".gif"))
            contentType = "image/gif";
        else if (filename.endsWith(".pdf"))
            contentType = "application/pdf";
        else if (filename.endsWith(".rvt"))
            contentType = "application/vnd.autodesk.revit"; // Standard Revit MIME
        else if (filename.endsWith(".ifc"))
            contentType = "application/x-ifc";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(data.length);

        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    /**
     * Validate uploaded file: not empty, within size limit, valid image type.
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Variable max size based on folder
        long maxSize = 10 * 1024 * 1024; // 10MB default
        String filename = file.getOriginalFilename();
        if (filename != null && (filename.endsWith(".rvt") || filename.endsWith(".ifc"))) {
            maxSize = 250 * 1024 * 1024; // 250MB for BIM files
        }

        if (file.getSize() > maxSize) {
            throw new RuntimeException("File size exceeds maximum limit of " + (maxSize / (1024 * 1024)) + "MB");
        }

        // Validate content type
        String contentType = file.getContentType();
        List<String> allowedTypes = List.of(
                "image/jpeg", "image/png", "image/gif", "image/webp",
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.autodesk.revit", // Revit
                "application/x-ifc", // IFC
                "application/octet-stream" // Generic binary for some Revit uploads
        );

        // Check extension if content type is generic or missing
        boolean isRevit = filename != null && (filename.endsWith(".rvt") || filename.endsWith(".ifc"));

        if (!isRevit && contentType != null && !allowedTypes.contains(contentType)) {
            throw new RuntimeException("File type not allowed: " + contentType);
        }
    }
}
