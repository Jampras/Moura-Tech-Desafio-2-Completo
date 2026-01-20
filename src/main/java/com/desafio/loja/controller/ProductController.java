package com.desafio.loja.controller;

import com.desafio.loja.dto.ProductDTO;
import com.desafio.loja.dto.ProductResponseDTO;
import com.desafio.loja.model.Product;
import com.desafio.loja.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products") // ✅ PADRONIZADO COM O FRONTEND
@Tag(name = "Produtos", description = "Operações de CRUD para produtos")
public class ProductController {

    // ========== CONSTANTES DE PAGINAÇÃO ==========
    private static final String DEFAULT_PAGE = "0";
    private static final String DEFAULT_SIZE = "10";
    private static final String DEFAULT_SORT = "name,asc";

    // ========== DEPENDÊNCIA ==========
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ===================== GET PAGINADO =====================
    @Operation(summary = "Listar produtos (paginado)")
    @ApiResponse(responseCode = "200", description = "Página retornada com sucesso")
    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> findAll(
            @RequestParam(defaultValue = DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = DEFAULT_SIZE) int size,
            @RequestParam(defaultValue = DEFAULT_SORT) String sort
    ) {

        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction =
                sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<ProductResponseDTO> result = productService.findAll(pageable)
                .map(ProductResponseDTO::fromEntity);

        return ResponseEntity.ok(result);
    }

    // ===================== GET LISTA (FRONT) =====================
    @Operation(summary = "Listar todos os produtos")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping("/all")
    public ResponseEntity<List<ProductResponseDTO>> findAllList() {

        List<ProductResponseDTO> products = productService.findAll()
                .stream()
                .map(ProductResponseDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(products);
    }

    // ===================== GET BY ID =====================
    @Operation(summary = "Buscar produto por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Produto encontrado"),
            @ApiResponse(responseCode = "404", description = "Produto não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> findById(
            @Parameter(description = "ID do produto") @PathVariable Long id
    ) {

        Product product = productService.findById(id);
        return ResponseEntity.ok(ProductResponseDTO.fromEntity(product));
    }

    // ===================== SEARCH =====================
    @Operation(summary = "Buscar produtos por nome")
    @ApiResponse(responseCode = "200", description = "Busca realizada")
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponseDTO>> findByName(
            @RequestParam String name,
            @RequestParam(defaultValue = DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = DEFAULT_SIZE) int size
    ) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        Page<ProductResponseDTO> result = productService.findByName(name, pageable)
                .map(ProductResponseDTO::fromEntity);

        return ResponseEntity.ok(result);
    }

    // ===================== CREATE =====================
    @Operation(summary = "Criar produto")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Produto criado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(
            @Valid @RequestBody ProductDTO dto
    ) {

        Product product = mapToEntity(dto);
        Product saved = productService.save(product);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ProductResponseDTO.fromEntity(saved));
    }

    // ===================== UPDATE =====================
    @Operation(summary = "Atualizar produto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Produto atualizado"),
            @ApiResponse(responseCode = "404", description = "Produto não encontrado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO dto
    ) {

        Product data = mapToEntity(dto);
        Product updated = productService.update(id, data);

        return ResponseEntity.ok(ProductResponseDTO.fromEntity(updated));
    }

    // ===================== DELETE =====================
    @Operation(summary = "Excluir produto")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Produto excluído"),
            @ApiResponse(responseCode = "404", description = "Produto não encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ===================== MAPPER =====================
    private Product mapToEntity(ProductDTO dto) {
        Product product = new Product();
        product.setName(dto.name());
        product.setPrice(dto.price());
        product.setStock(dto.stock());
        product.setImage(dto.image());
        product.setCategory(dto.category());
        return product;
    }
}
