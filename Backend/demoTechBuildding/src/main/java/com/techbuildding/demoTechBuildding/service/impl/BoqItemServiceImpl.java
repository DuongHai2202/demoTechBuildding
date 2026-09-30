package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.contract.BoqItemRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.contract.BoqItemResponseDTO;
import com.techbuildding.demoTechBuildding.entity.BoqItem;
import com.techbuildding.demoTechBuildding.entity.Contract;
import com.techbuildding.demoTechBuildding.repository.BoqItemRepository;
import com.techbuildding.demoTechBuildding.repository.ContractRepository;
import com.techbuildding.demoTechBuildding.service.BoqItemService;
import com.techbuildding.demoTechBuildding.exception.BadRequestException;
import com.techbuildding.demoTechBuildding.exception.DuplicateResourceException;
import com.techbuildding.demoTechBuildding.util.code.StandardCodeGenerator;
import com.techbuildding.demoTechBuildding.util.code.StandardCodeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoqItemServiceImpl implements BoqItemService {

    private final BoqItemRepository boqItemRepository;
    private final ContractRepository contractRepository;
    private final StandardCodeGenerator codeGenerator;

    @Override
    public BoqItemResponseDTO createBoqItem(BoqItemRequestDTO request) {
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy hợp đồng để thêm hạng mục."));

        BoqItem parent = null;
        if (request.getParentId() != null) {
            parent = boqItemRepository.findById(request.getParentId())
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy hạng mục cha đã chọn."));
            if (parent.getContract() == null || !contract.getId().equals(parent.getContract().getId())) {
                throw new BadRequestException("Hạng mục cha phải thuộc cùng hợp đồng hiện tại.");
            }
        }

        String itemCode = codeGenerator.cleanProvidedCode(request.getItemCode());
        if (itemCode == null) {
            itemCode = codeGenerator.next(StandardCodeType.BOQ_ITEM, boqItemRepository::existsByItemCode);
        } else if (boqItemRepository.existsByItemCode(itemCode)) {
            throw new DuplicateResourceException("Mã hạng mục '" + itemCode + "' đã tồn tại.");
        }

        BigDecimal unitPrice = request.getUnitPrice() != null ? request.getUnitPrice() : BigDecimal.ZERO;
        BigDecimal quantity = BigDecimal.valueOf(request.getQuantity() != null ? request.getQuantity() : 0);
        BigDecimal totalPrice = unitPrice.multiply(quantity);
        
        BigDecimal vatRate = request.getVatRate() != null ? request.getVatRate() : BigDecimal.ZERO;
        BigDecimal vatAmount = totalPrice.multiply(vatRate).divide(BigDecimal.valueOf(100));
        BigDecimal totalWithVat = totalPrice.add(vatAmount);

        BoqItem item = BoqItem.builder()
                .contract(contract)
                .itemCode(itemCode)
                .description(request.getDescription())
                .unit(request.getUnit())
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .totalPrice(totalPrice)
                .vatRate(vatRate)
                .vatAmount(vatAmount)
                .totalWithVat(totalWithVat)
                .parentItem(parent)
                .bimId(request.getBimId())
                .build();

        return mapToResponse(boqItemRepository.save(item));
    }

    @Override
    public List<BoqItemResponseDTO> getBoqItemsByContract(Integer contractId) {
        return boqItemRepository.findByContractId(contractId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteBoqItem(Integer id) {
        boqItemRepository.deleteById(id);
    }

    private BoqItemResponseDTO mapToResponse(BoqItem item) {
        BoqItemResponseDTO dto = new BoqItemResponseDTO();
        dto.setId(item.getId());
        dto.setContractId(item.getContract().getId());
        dto.setItemCode(item.getItemCode());
        dto.setDescription(item.getDescription());
        dto.setUnit(item.getUnit());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        dto.setVatRate(item.getVatRate());
        dto.setVatAmount(item.getVatAmount());
        dto.setTotalWithVat(item.getTotalWithVat());
        dto.setParentId(item.getParentItem() != null ? item.getParentItem().getId() : null);
        dto.setParentCode(item.getParentItem() != null ? item.getParentItem().getItemCode() : null);
        dto.setBimId(item.getBimId());
        return dto;
    }
}
