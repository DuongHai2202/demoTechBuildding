package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Integer> {

    List<ProjectMember> findByProjectId(Integer projectId);

    List<ProjectMember> findByUserId(Long userId);

    Optional<ProjectMember> findByProjectIdAndUserId(Integer projectId, Long userId);

    boolean existsByProjectIdAndUserId(Integer projectId, Long userId);
}
