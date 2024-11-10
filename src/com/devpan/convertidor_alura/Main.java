package com.devpan.convertidor_alura;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        ApiRequest apiRequest = new ApiRequest();
        Scanner scanner = new Scanner(System.in);
        double monto;
        List<String> monedasPermitidas  = Arrays.asList("ARS", "BOB", "BRL", "CLP", "COP", "USD", "MXN");

        System.out.println("CONVERSOR DE MONEDAS\nLas monedas disponibles son las siguientes elige una: \n");
        System.out.println("Peso Argentino => ARS \nPeso Mexicano => MXN \nBoliviano => BOB" +
                "\nReal Brasileño => BRL \nPeso Chileno => CLP \nPeso Colombiano => COP" +
                "\nDolar Estadounidense => USD\n");


        String monedaBase;
        while (true){
            System.out.println("Ingresa una moneda base: ");
            monedaBase = scanner.nextLine().toUpperCase();
            if (monedasPermitidas.contains(monedaBase)){
                break;
            } else {
                System.out.println("Moneda base no permitida por favor usa una de las siguientes " + monedasPermitidas + "\n");
            }
        }


        String monedaDestino;
        while (true){
            System.out.println("Ingresa una moneda destino: ");
            monedaDestino = scanner.nextLine().toUpperCase();
            if (monedasPermitidas.contains(monedaDestino)){
                break;
            } else {
                System.out.println("Moneda base no permitida por favor usa una de las siguientes " + monedasPermitidas + "\n");
            }
        }


        System.out.println("¿Que cantidad quieres convertir?");
        int cantidad = scanner.nextInt();

        JsonNode datosPar = apiRequest.getDatosPar(monedaBase, monedaDestino);
        if (datosPar != null && datosPar.has("conversion_rate")) {
            System.out.println("La tasa de conversion " + monedaBase + " a " + monedaDestino + " es de: "
                    + datosPar.get("conversion_rate").asDouble());
        }

        monto = cantidad * datosPar.get("conversion_rate").asDouble();
        System.out.println(cantidad + " " + monedaBase + " a " + monedaDestino + " equivalen a " + monto);

    }

}
