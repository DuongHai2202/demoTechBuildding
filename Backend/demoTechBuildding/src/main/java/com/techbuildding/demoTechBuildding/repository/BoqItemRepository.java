package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.BoqItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoqItemRepository extends JpaRepository<BoqItem, Integer> {

    List<BoqItem> findByContractId(Integer contractId);
}
