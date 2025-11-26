package com.mediconnect.rendezvous_service.dto;

//import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateRdvRequest {
    private Long patientId;
    private Long doctorId;
    //@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime date;
}
