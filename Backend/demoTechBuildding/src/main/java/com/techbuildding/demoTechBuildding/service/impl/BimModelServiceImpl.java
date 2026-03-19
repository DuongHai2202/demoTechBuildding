package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.request.bim.BimModelRequestDTO;
import com.techbuildding.demoTechBuildding.dto.response.bim.BimModelResponseDTO;
import com.techbuildding.demoTechBuildding.entity.BimModel;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.entity.Zone;
import com.techbuildding.demoTechBuildding.mapper.BimModelMapper;
import com.techbuildding.demoTechBuildding.repository.BimModelRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.repository.ZoneRepository;
import com.techbuildding.demoTechBuildding.service.BimModelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BimModelServiceImpl implements BimModelService {

    private final BimModelRepository bimModelRepository;
    private final ProjectRepository projectRepository;
    private final ZoneRepository zoneRepository;
    private final BimModelMapper bimModelMapper;

    @Override
    @Transactional
    public BimModelResponseDTO createModel(BimModelRequestDTO request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Zone zone = null;
        if (request.getZoneId() != null) {
            zone = zoneRepository.findById(request.getZoneId())
                    .orElseThrow(() -> new RuntimeException("Zone not found"));
        }

        BimModel model = bimModelMapper.toEntity(request);
        model.setProject(project);
        model.setZone(zone);

        return bimModelMapper.toResponseDTO(bimModelRepository.save(model));
    }

    @Override
    public List<BimModelResponseDTO> getModelsByProject(Integer projectId, Integer zoneId) {
        List<BimModel> models;
        if (zoneId != null) {
            models = bimModelRepository.findByProjectIdAndZoneId(projectId, zoneId);
        } else {
            models = bimModelRepository.findByProjectId(projectId);
        }
        return models.stream().map(bimModelMapper::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BimModelResponseDTO updateModel(Integer id, BimModelRequestDTO request) {
        BimModel model = bimModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("BIM Model not found"));

        bimModelMapper.updateEntity(model, request);
        return bimModelMapper.toResponseDTO(bimModelRepository.save(model));
    }

    @Override
    @Transactional
    public void deleteModel(Integer id) {
        bimModelRepository.deleteById(id);
    }
}
