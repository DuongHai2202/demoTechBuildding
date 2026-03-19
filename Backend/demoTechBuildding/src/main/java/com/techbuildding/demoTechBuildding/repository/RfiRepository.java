package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.Rfi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RfiRepository extends JpaRepository<Rfi, Integer> {
    List<Rfi> findByProjectId(Integer projectId);
    List<Rfi> findByProjectIdAndDesignSheet_ZoneId(Integer projectId, Integer zoneId);
    List<Rfi> findByDesignSheetId(Integer sheetId);
}
