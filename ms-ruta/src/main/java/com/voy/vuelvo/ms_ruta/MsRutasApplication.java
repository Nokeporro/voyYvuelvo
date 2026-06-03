package com.voy.vuelvo.ms_ruta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class MsRutasApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsRutasApplication.class, args);
	}
}

