package com.voy.vuelvo.ms_pago;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MsPagoApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsPagoApplication.class, args);
	}
}