package com.voy_vuelvo.api_getaway.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class LoginRequest {

    private String username;
    private String password;

}