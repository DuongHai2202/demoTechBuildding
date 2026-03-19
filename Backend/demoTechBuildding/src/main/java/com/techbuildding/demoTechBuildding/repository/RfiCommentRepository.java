package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.RfiComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RfiCommentRepository extends JpaRepository<RfiComment, Integer> {
    List<RfiComment> findByRfiId(Integer rfiId);
}
