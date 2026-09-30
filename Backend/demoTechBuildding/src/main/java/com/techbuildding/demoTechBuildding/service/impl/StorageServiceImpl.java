package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.service.StorageService;
import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * MinIO implementation of StorageService.
 *
 * Features:
 * - Auto-create bucket if not exists
 * - Generate unique filenames (UUID) to prevent collisions
 * - Support subfolder structure: bucket/avatars/uuid.jpg
 * - Return full URL for direct file access
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StorageServiceImpl implements StorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String endpoint;

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        log.info("Uploading file: {} to folder: {}", file.getOriginalFilename(), folder);

        try {
            // Auto-create bucket if not exists
            ensureBucketExists();

            // Generate unique filename: folder/uuid-originalname.ext
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String objectName = folder + "/" + UUID.randomUUID() + extension;

            // Upload file to MinIO
            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectName)
                                .stream(inputStream, file.getSize(), -1)
                                .contentType(file.getContentType())
                                .build());
            }

            // Build public URL
            String fileUrl = endpoint + "/" + bucketName + "/" + objectName;

            log.info("File uploaded successfully: {}", fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("Failed to upload file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String folder, String filename) {
        log.info("Deleting file: {}/{}", folder, filename);

        try {
            String objectName = folder + "/" + filename;
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build());
            log.info("File deleted successfully: {}", objectName);

        } catch (Exception e) {
            log.error("Failed to delete file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    @Override
    public byte[] downloadFile(String folder, String filename) {
        log.info("Downloading file: {}/{}", folder, filename);
        try {
            String objectName = folder + "/" + filename;
            try (InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build())) {
                return stream.readAllBytes();
            }
        } catch (Exception e) {
            log.error("Failed to download file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to download file: " + e.getMessage());
        }
    }

    @Override
    public byte[] downloadFileByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new IllegalArgumentException("File URL không được để trống.");
        }

        try {
            URI uri = URI.create(fileUrl);
            String path = uri.getPath();
            String bucketPrefix = "/" + bucketName + "/";
            int objectStart = path.indexOf(bucketPrefix);
            if (objectStart < 0) {
                throw new IllegalArgumentException("File URL không thuộc kho lưu trữ của hệ thống.");
            }

            String objectName = URLDecoder.decode(
                    path.substring(objectStart + bucketPrefix.length()),
                    StandardCharsets.UTF_8);
            if (objectName.isBlank() || objectName.contains("..")) {
                throw new IllegalArgumentException("Đường dẫn file không hợp lệ.");
            }

            try (InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build())) {
                return stream.readAllBytes();
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to download file by URL: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tải tài liệu từ kho lưu trữ.", e);
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build());
        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucketName).build());
            log.info("Bucket created: {}", bucketName);
        }
            
        // Set bucket policy to allow public read access
        String policy = "{\n" +
                "  \"Version\": \"2012-10-17\",\n" +
                "  \"Statement\": [\n" +
                "    {\n" +
                "      \"Effect\": \"Allow\",\n" +
                "      \"Principal\": \"*\",\n" +
                "      \"Action\": [\"s3:GetObject\"],\n" +
                "      \"Resource\": [\"arn:aws:s3:::" + bucketName + "/*\"]\n" +
                "    }\n" +
                "  ]\n" +
                "}";
        
        minioClient.setBucketPolicy(
                SetBucketPolicyArgs.builder()
                        .bucket(bucketName)
                        .config(policy)
                        .build());
        log.info("Bucket policy set to public read for: {}", bucketName);
    }

    /**
     * Extract file extension from filename (e.g., ".jpg", ".png").
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
