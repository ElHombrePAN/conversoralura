package com.devpan.convertidor_alura;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.cdimascio.dotenv.Dotenv;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiRequest {

    private static final Dotenv dotenv = Dotenv.load();
    private static final String APIKEY = dotenv.get("API_KEY");
    private static final String API_URL = "https://v6.exchangerate-api.com/v6/" + APIKEY;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode getDatosMonedaBase(String monedaBase){
        String apiUrl = API_URL + "/latest/" + monedaBase;
        return getJsonRespuesta(apiUrl);
    }

    public JsonNode getDatosPar(String monedaBase, String monedaDestino){
        String apiUrl = API_URL + "/pair/" + monedaBase + "/" + monedaDestino;
        return getJsonRespuesta(apiUrl);
    }

    public JsonNode getDatosTodasLasMonedas(){
        String apiUrl = API_URL + "/codes";
        return getJsonRespuesta(apiUrl);
    }

    private JsonNode getJsonRespuesta(String apiUrl){
        try {
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            int codigoDeRespuesta = connection.getResponseCode();
            if (codigoDeRespuesta == 200) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder contenido = new StringBuilder();
                String inputLine;
                while ((inputLine = in.readLine()) != null){
                    contenido.append(inputLine);
                }
                in.close();
                return objectMapper.readTree(contenido.toString());
            } else {
                System.out.println("Error de respuesta: " + codigoDeRespuesta);
                return null;
            }
        } catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }
}
