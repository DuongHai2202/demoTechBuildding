package com.techbuildding.demoTechBuildding.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service interface for file storage operations (MinIO/S3).
 */
public interface StorageService {

    /**
     * Upload a file to MinIO and return the public URL.
     *
     * @param file   the file to upload
     * @param folder subfolder in bucket (e.g., "avatars", "attendance",
     *               "documents")
     * @return public URL of the uploaded file
     */
    String uploadFile(MultipartFile file, String folder);

    /**
     * Delete a file from MinIO by its filename.
     *
     * @param folder   subfolder in bucket
     * @param filename name of the file to delete
     */
    void deleteFile(String folder, String filename);

    /**
     * Download a file from MinIO.
     *
     * @param folder   subfolder in bucket
     * @param filename name of the file to download
     * @return file content as byte array
     */
    byte[] downloadFile(String folder, String filename);
}
