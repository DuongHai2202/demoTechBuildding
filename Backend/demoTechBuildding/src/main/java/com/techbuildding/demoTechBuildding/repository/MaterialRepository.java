package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Integer> {
    Optional<Material> findByRevitCode(String revitCode);
}
