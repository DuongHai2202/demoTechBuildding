package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.ProjectSlide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectSlideRepository extends JpaRepository<ProjectSlide, Integer> {
    List<ProjectSlide> findByProjectIdOrderByDisplayOrderAsc(Integer projectId);
}
