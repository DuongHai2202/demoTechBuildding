package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.ContractMaterialLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractMaterialLimitRepository extends JpaRepository<ContractMaterialLimit, Integer> {
    List<ContractMaterialLimit> findByContractId(Integer contractId);
}
