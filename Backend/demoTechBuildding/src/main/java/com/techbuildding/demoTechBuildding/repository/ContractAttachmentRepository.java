package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.ContractAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractAttachmentRepository extends JpaRepository<ContractAttachment, Integer> {
    List<ContractAttachment> findByContractIdAndIsDeletedFalse(Integer contractId);
}
