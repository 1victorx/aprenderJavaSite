package com.javastudy.exercise;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder {
    private final ExerciseRepository exerciseRepository;

    public DataSeeder(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @PostConstruct
    @Transactional
    public void seed() {
        if (exerciseRepository.count() > 0) {
            return;
        }

        seedAlgorithms();
        seedOOPatterns();
        seedJavaCore();
        seedConcurrency();
    }

    private void seedAlgorithms() {
        // Binary Search
        Exercise binarySearch = Exercise.builder()
            .slug("binary-search")
            .title("Busca Binária")
            .description("""
                Implemente o algoritmo de busca binária para encontrar um elemento em um array ordenado.
                
                **Entrada:**
                - `nums`: array de inteiros ordenado em ordem crescente
                - `target`: inteiro a ser buscado
                
                **Saída:**
                - Índice do target no array, ou -1 se não encontrado
                
                **Restrições:**
                - 1 <= nums.length <= 10^4
                - -10^4 <= nums[i], target <= 10^4
                - Todos os elementos são únicos
                - Array está ordenado em ordem crescente
                
                **Exemplo 1:**
                ```
                Entrada: nums = [-1,0,3,5,9,12], target = 9
                Saída: 4
                ```
                
                **Exemplo 2:**
                ```
                Entrada: nums = [-1,0,3,5,9,12], target = 2
                Saída: -1
                ```
                """)
            .category(ExerciseCategory.ALGORITHMS)
            .difficulty(Difficulty.EASY)
            .starterCode("""
                class Solution {
                    public int search(int[] nums, int target) {
                        // Seu código aqui
                    }
                }
                """)
            .xpReward(10)
            .order(1)
            .build();

        binarySearch.addTestCase(TestCase.builder()
            .inputData("[-1,0,3,5,9,12]\n9")
            .expectedOutput("4")
            .isHidden(false)
            .order(1)
            .build());
        binarySearch.addTestCase(TestCase.builder()
            .inputData("[-1,0,3,5,9,12]\n2")
            .expectedOutput("-1")
            .isHidden(false)
            .order(2)
            .build());
        binarySearch.addTestCase(TestCase.builder()
            .inputData("[5]\n5")
            .expectedOutput("0")
            .isHidden(true)
            .order(3)
            .build());
        binarySearch.addTestCase(TestCase.builder()
            .inputData("[1,3,5,7,9]\n1")
            .expectedOutput("0")
            .isHidden(true)
            .order(4)
            .build());
        binarySearch.addTestCase(TestCase.builder()
            .inputData("[1,3,5,7,9]\n9")
            .expectedOutput("4")
            .isHidden(true)
            .order(5)
            .build());

        exerciseRepository.save(binarySearch);

        // Two Sum
        Exercise twoSum = Exercise.builder()
            .slug("two-sum")
            .title("Soma de Dois Números")
            .description("""
                Dado um array de inteiros e um target, retorne os índices dos dois números que somam ao target.
                
                **Entrada:**
                - `nums`: array de inteiros
                - `target`: inteiro alvo
                
                **Saída:**
                - Array com dois índices (ordem não importa)
                
                **Restrições:**
                - 2 <= nums.length <= 10^4
                - -10^9 <= nums[i] <= 10^9
                - -10^9 <= target <= 10^9
                - Existe exatamente uma solução válida
                
                **Exemplo:**
                ```
                Entrada: nums = [2,7,11,15], target = 9
                Saída: [0,1]
                ```
                """)
            .category(ExerciseCategory.ALGORITHMS)
            .difficulty(Difficulty.EASY)
            .starterCode("""
                class Solution {
                    public int[] twoSum(int[] nums, int target) {
                        // Seu código aqui
                    }
                }
                """)
            .xpReward(10)
            .order(2)
            .build();

        twoSum.addTestCase(TestCase.builder()
            .inputData("[2,7,11,15]\n9")
            .expectedOutput("[0, 1]")
            .isHidden(false)
            .order(1)
            .build());
        twoSum.addTestCase(TestCase.builder()
            .inputData("[3,2,4]\n6")
            .expectedOutput("[1, 2]")
            .isHidden(true)
            .order(2)
            .build());
        twoSum.addTestCase(TestCase.builder()
            .inputData("[3,3]\n6")
            .expectedOutput("[0, 1]")
            .isHidden(true)
            .order(3)
            .build());

        exerciseRepository.save(twoSum);

        // Merge Sort
        Exercise mergeSort = Exercise.builder()
            .slug("merge-sort")
            .title("Merge Sort")
            .description("""
                Implemente o algoritmo Merge Sort para ordenar um array de inteiros.
                
                **Entrada:**
                - `nums`: array de inteiros não ordenado
                
                **Saída:**
                - Array ordenado em ordem crescente
                
                **Restrições:**
                - 1 <= nums.length <= 10^3
                - -10^4 <= nums[i] <= 10^4
                
                **Exemplo:**
                ```
                Entrada: [5,2,3,1]
                Saída: [1,2,3,5]
                ```
                """)
            .category(ExerciseCategory.ALGORITHMS)
            .difficulty(Difficulty.MEDIUM)
            .starterCode("""
                class Solution {
                    public int[] sortArray(int[] nums) {
                        // Seu código aqui
                    }
                }
                """)
            .xpReward(20)
            .order(3)
            .build();

        mergeSort.addTestCase(TestCase.builder()
            .inputData("[5,2,3,1]")
            .expectedOutput("[1, 2, 3, 5]")
            .isHidden(false)
            .order(1)
            .build());
        mergeSort.addTestCase(TestCase.builder()
            .inputData("[5,1,1,2,0,0]")
            .expectedOutput("[0, 0, 1, 1, 2, 5]")
            .isHidden(true)
            .order(2)
            .build());

        exerciseRepository.save(mergeSort);
    }

    private void seedOOPatterns() {
        // Factory Pattern
        Exercise factory = Exercise.builder()
            .slug("factory-pattern")
            .title("Factory Pattern")
            .description("""
                Implemente o padrão Factory Method para criar diferentes tipos de formas geométricas.
                
                **Requisitos:**
                1. Crie uma interface `Shape` com método `draw()`
                2. Implemente `Circle`, `Rectangle`, `Triangle`
                3. Crie uma `ShapeFactory` com método `createShape(String type)`
                4. Tipos válidos: "circle", "rectangle", "triangle"
                
                **Exemplo de uso:**
                ```java
                Shape shape = ShapeFactory.createShape("circle");
                shape.draw(); // "Desenhando círculo"
                ```
                """)
            .category(ExerciseCategory.OO_PATTERNS)
            .difficulty(Difficulty.EASY)
            .starterCode("""
                interface Shape {
                    String draw();
                }
                
                class Circle implements Shape {
                    public String draw() { return "Desenhando círculo"; }
                }
                
                class Rectangle implements Shape {
                    public String draw() { return "Desenhando retângulo"; }
                }
                
                class Triangle implements Shape {
                    public String draw() { return "Desenhando triângulo"; }
                }
                
                class ShapeFactory {
                    public static Shape createShape(String type) {
                        // Seu código aqui
                    }
                }
                
                class Solution {
                    public String[] testFactory(String[] types) {
                        // Retorne array com resultados de draw() para cada tipo
                    }
                }
                """)
            .xpReward(15)
            .order(1)
            .build();

        factory.addTestCase(TestCase.builder()
            .inputData("[\"circle\", \"rectangle\", \"triangle\"]")
            .expectedOutput("[\"Desenhando círculo\", \"Desenhando retângulo\", \"Desenhando triângulo\"]")
            .isHidden(false)
            .order(1)
            .build());
        factory.addTestCase(TestCase.builder()
            .inputData("[\"circle\", \"circle\"]")
            .expectedOutput("[\"Desenhando círculo\", \"Desenhando círculo\"]")
            .isHidden(true)
            .order(2)
            .build());

        exerciseRepository.save(factory);

        // Singleton Pattern
        Exercise singleton = Exercise.builder()
            .slug("singleton-pattern")
            .title("Singleton Pattern")
            .description("""
                Implemente o padrão Singleton thread-safe usando enum (forma recomendada em Java).
                
                **Requisitos:**
                1. Crie um enum `DatabaseConnection` que garanta uma única instância
                2. Método `connect()` retorna "Conectado ao banco"
                3. Método `disconnect()` retorna "Desconectado do banco"
                
                **Exemplo:**
                ```java
                DatabaseConnection conn = DatabaseConnection.INSTANCE;
                conn.connect(); // "Conectado ao banco"
                ```
                """)
            .category(ExerciseCategory.OO_PATTERNS)
            .difficulty(Difficulty.EASY)
            .starterCode("""
                enum DatabaseConnection {
                    INSTANCE;
                    
                    public String connect() {
                        // Seu código aqui
                    }
                    
                    public String disconnect() {
                        // Seu código aqui
                    }
                }
                
                class Solution {
                    public String[] testSingleton() {
                        DatabaseConnection conn1 = DatabaseConnection.INSTANCE;
                        DatabaseConnection conn2 = DatabaseConnection.INSTANCE;
                        String r1 = conn1.connect();
                        String r2 = conn2.disconnect();
                        return new String[]{r1, r2, String.valueOf(conn1 == conn2)};
                    }
                }
                """)
            .xpReward(15)
            .order(2)
            .build();

        singleton.addTestCase(TestCase.builder()
            .inputData("")
            .expectedOutput("[\"Conectado ao banco\", \"Desconectado do banco\", \"true\"]")
            .isHidden(false)
            .order(1)
            .build());

        exerciseRepository.save(singleton);
    }

    private void seedJavaCore() {
        // Stream API Basics
        Exercise streams = Exercise.builder()
            .slug("stream-api-basics")
            .title("Stream API Básica")
            .description("""
                Use Stream API para filtrar, transformar e coletar dados.
                
                **Tarefa:** Dada uma lista de usuários, retorne os nomes dos usuários maiores de 18 anos,
                em maiúsculas, ordenados alfabeticamente.
                
                **Classe User:**
                ```java
                record User(String name, int age) {}
                ```
                
                **Exemplo:**
                ```
                Entrada: [User("Ana", 25), User("João", 17), User("Maria", 30), User("Pedro", 16)]
                Saída: ["ANA", "MARIA"]
                ```
                """)
            .category(ExerciseCategory.JAVA_CORE)
            .difficulty(Difficulty.EASY)
            .starterCode("""
                import java.util.*;
                import java.util.stream.*;
                
                record User(String name, int age) {}
                
                class Solution {
                    public List<String> filterAdults(List<User> users) {
                        // Seu código aqui usando Stream API
                    }
                }
                """)
            .xpReward(10)
            .order(1)
            .build();

        streams.addTestCase(TestCase.builder()
            .inputData("[User(\"Ana\", 25), User(\"João\", 17), User(\"Maria\", 30), User(\"Pedro\", 16)]")
            .expectedOutput("[ANA, MARIA]")
            .isHidden(false)
            .order(1)
            .build());
        streams.addTestCase(TestCase.builder()
            .inputData("[User(\"Zoe\", 20), User(\"Bob\", 22)]")
            .expectedOutput("[BOB, ZOE]")
            .isHidden(true)
            .order(2)
            .build());

        exerciseRepository.save(streams);

        // Optional
        Exercise optional = Exercise.builder()
            .slug("optional-usage")
            .title("Uso de Optional")
            .description("""
                Pratique o uso correto de Optional para evitar NullPointerException.
                
                **Tarefa:** Implemente um método que busca um usuário por ID e retorna o nome em maiúsculas,
                ou "USUÁRIO NÃO ENCONTRADO" se não existir.
                
                **Exemplo:**
                ```
                Entrada: 1 (existe)
                Saída: "ANA"
                
                Entrada: 999 (não existe)
                Saída: "USUÁRIO NÃO ENCONTRADO"
                ```
                """)
            .category(ExerciseCategory.JAVA_CORE)
            .difficulty(Difficulty.EASY)
            .starterCode("""
                import java.util.*;
                import java.util.Optional;
                
                record User(int id, String name) {}
                
                class Solution {
                    private final Map<Integer, User> users = Map.of(
                        1, new User(1, "Ana"),
                        2, new User(2, "João"),
                        3, new User(3, "Maria")
                    );
                    
                    public String findUserName(int id) {
                        // Seu código aqui usando Optional
                    }
                }
                """)
            .xpReward(10)
            .order(2)
            .build();

        optional.addTestCase(TestCase.builder()
            .inputData("1")
            .expectedOutput("ANA")
            .isHidden(false)
            .order(1)
            .build());
        optional.addTestCase(TestCase.builder()
            .inputData("999")
            .expectedOutput("USUÁRIO NÃO ENCONTRADO")
            .isHidden(true)
            .order(2)
            .build());

        exerciseRepository.save(optional);
    }

    private void seedConcurrency() {
        // CompletableFuture Basics
        Exercise completableFuture = Exercise.builder()
            .slug("completable-future-basics")
            .title("CompletableFuture Básico")
            .description("""
                Use CompletableFuture para executar tarefas assíncronas e combinar resultados.
                
                **Tarefa:** Simule duas chamadas de API assíncronas que retornam strings,
                combine os resultados concatenando-os.
                
                **Exemplo:**
                ```
                API 1 retorna: "Hello"
                API 2 retorna: "World"
                Resultado: "Hello World"
                ```
                """)
            .category(ExerciseCategory.CONCURRENCY)
            .difficulty(Difficulty.MEDIUM)
            .starterCode("""
                import java.util.concurrent.*;
                
                class Solution {
                    public String combineAsync() throws Exception {
                        // Simule duas tarefas assíncronas com CompletableFuture
                        // Retorne a concatenação dos resultados
                    }
                }
                """)
            .xpReward(20)
            .order(1)
            .build();

        completableFuture.addTestCase(TestCase.builder()
            .inputData("")
            .expectedOutput("Hello World")
            .isHidden(false)
            .order(1)
            .build());

        exerciseRepository.save(completableFuture);

        // Virtual Threads
        Exercise virtualThreads = Exercise.builder()
            .slug("virtual-threads")
            .title("Virtual Threads (Java 21)")
            .description("""
                Experimente Virtual Threads introduzidas no Java 21.
                
                **Tarefa:** Crie 1000 virtual threads que cada uma dorme por 10ms,
                meça o tempo total (deve ser ~10ms, não 10 segundos).
                
                **Exemplo:**
                ```
                Saída: "Tempo: X ms" (onde X ~ 10-50)
                ```
                """)
            .category(ExerciseCategory.CONCURRENCY)
            .difficulty(Difficulty.MEDIUM)
            .starterCode("""
                import java.time.*;
                import java.util.concurrent.*;
                
                class Solution {
                    public String testVirtualThreads() throws Exception {
                        Instant start = Instant.now();
                        
                        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
                            // Submeta 1000 tarefas que dormem 10ms
                        }
                        
                        long elapsed = Duration.between(start, Instant.now()).toMillis();
                        return "Tempo: " + elapsed + " ms";
                    }
                }
                """)
            .xpReward(25)
            .order(2)
            .build();

        virtualThreads.addTestCase(TestCase.builder()
            .inputData("")
            .expectedOutput("Tempo:")
            .isHidden(false)
            .order(1)
            .build());

        exerciseRepository.save(virtualThreads);
    }
}