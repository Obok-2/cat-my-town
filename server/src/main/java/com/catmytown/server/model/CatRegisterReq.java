package com.catmytown.server.model;

import java.math.BigDecimal;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CatRegisterReq {

    private String analysisId;

    private String name;

    private List<String> tags;

    private String memo;

    private BigDecimal latitude;

    private BigDecimal longitude;

}
