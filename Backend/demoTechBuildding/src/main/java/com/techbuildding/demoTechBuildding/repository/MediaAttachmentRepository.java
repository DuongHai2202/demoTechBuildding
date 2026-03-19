package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.MediaAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaAttachmentRepository extends JpaRepository<MediaAttachment, Long> {

    List<MediaAttachment> findByWorkLogId(Long workLogId);
}
