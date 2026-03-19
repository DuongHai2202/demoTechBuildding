package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.MaterialCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialCategoryRepository extends JpaRepository<MaterialCategory, Integer> {
}
