package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.MaterialNorm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialNormRepository extends JpaRepository<MaterialNorm, Integer> {
    List<MaterialNorm> findByBoqItemId(Integer boqItemId);
}
