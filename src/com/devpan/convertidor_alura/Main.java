package com.devpan.convertidor_alura;

import com.fasterxml.jackson.databind.JsonNode;

public class Main {
    public static void main(String[] args) {

        ApiRequest apiRequest = new ApiRequest();
        JsonNode datosPar = apiRequest.getDatosPar("USD", "MXN");
        if (datosPar != null && datosPar.has("conversion_rate")) {
            System.out.println("Tasa de conversion USD a MXN es de: " + datosPar.get("conversion_rate").asDouble());
        }

    }

}
