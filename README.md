# Flat Shading

## Objetivo

### Parte Geral

Implementar o método de visualização de objetos triangulados, através do
algoritmo de conversão por varredura, com métodos de interpolação de Phong, com a
visibilidade garantida pelo algoritmo do “z-buffer”.

### Parte Específica

Implementar o método de visualização de objetos triangulados utilizando uma equação
de iluminação de Phong por triângulo (Flat Shading).

## Descrição

1 - O usuário, através de arquivos-texto ou interface gráfica, entra com: 
    1 - dados do objeto (triangulado, com lista dos vértices e da conectividade, que determina os triângulos, de um arquivo-texto),
    2 - atributos do objeto (ka, ponto flutuante entre 0 e 1, kd, tripla de ponto flutuante entre 0 e 1, ks, ponto flutuante entre 0 e 1, 
    Od, tripla de ponto flutuante entre 0 e 1, e hponto flutuante positivo),
    3 - atributos da cena (Ia, IL, triplas de ponto flutuante entre 0 e 255, PL, tripla de ponto flutuante)
    4 - os atributos da câmera virtual (C, N e V, triplas de ponto flutuante, d, hx, e hy, ponto flutuante não negativo).

2 - O seu sistema começa preparando a câmera, gerando U apartir da ortogonalização de N e V, e depois os normalizando, 

3 - Fazer a mudança de coordenadas para o sistema de vista de todos os vértices dos objetos e da posição da fonte de luz PL, 

4- Gerar as normais dos triângulos, gerar as normais dos vértices.

5 - Ordenam-se os triângulos do objeto segundo a distância dos seus baricentros para a origem, do mais distante para o mais próximo
Para que se faça a conversão do mais distante primeiro (Zbuffer) 

6 - Para cada triângulo na lista ordenada, e tomando-se o baricentro como referência,
    1 - Calculam-se os demais vetores da equação de iluminação: L, V e R e os substitui na equação do modelo de iluminação de 
    Phong produzindo a cor do triângulo.
    2 - Calculam-se as projeções dos seus vértices e inicia-se a sua conversão por varredura com coerência geométrica (scanline) 
    pintando todos os pixels do triângulo com a cor calculada.

7 - Para executar a conversão de um dado triângulo, antes de qualquer coisa, seus vértices são projetados em perspectiva sobre o plano de vista 
(mas guardam-se também seus vértices não projetados).Para cada pixel de coordenadas (x, yscan) do interior do triângulo projetado, encontram-se suas 
coordenadas baricêntricas com relação aos vértices deste triângulo projetado. Estas coordenadas baricêntricas são multiplicadas pelos respectivos 
vértices não projetados originais, obtendo-se assim uma aproximação para o ponto P do espaço 3D cuja projeção é (x, yscan). Com a coordenada z desta 
aproximação de P, faz-se uma consulta ao z-buffer para se saber se é necessário se fazer o cálculo da iluminação, ou seja, se a aproximação calculada 
está mais próxima que a aproximação feita anteriormente para outro ponto cuja projeção é (x, yscan).   
Se for o caso, as mesmas coordenadas baricêntricas são multiplicadas pelas respectivas normais para se obter uma aproximação para a normal no ponto P.

8 - Também utilizando a aproximação de P, calcula-se V e L; com L e N (normal) calcula-se R e substituem-se estes vetores na equação do modelo de iluminação 
de Phong, juntamente com os parâmetros fornecidos pelo usuário, calcula-se a cor do pixel (x, yscan). 

Nota:
Antes de executar a conversão de um dado triângulo, para cada baricentro são computados os vetores de iluminação (V, L, e R),
e substituídos na equação do modelo de iluminação de Phong, gerando a cor do triângulo.
Em seguida, os vértices são projetados e uma rotina de preenchimento de triângulos da biblioteca gráfica é utilizada.

## Observações

- Alguns arquivos de objetos serão providos. O padrão do arquivo deve ser o dos que serão providos.
- O sistema deve poder aceitar a troca dos objetos sem necessariamente ser reinicializado.
- O seu sistema deve tratar de casos especiais de posições relativas de fonte de luz, câmera e ponto a ser observado no objeto.

- Esteja preparado para modificar o código no momento da apresentação. A
modificação a ser feita será divulgada no momento da apresentação, e todos os
componentes serão convocados. As notas poderão ser diferentes, dependendo do
desempenho na modificação. Tipicamente, os decrementos na nota por erros no sistema são:

i)falhas em seguir a especificação, estouro de memória na execução repetida, falhas de
ordem geométrica, falhas de modelo: 1 pt. por falha; 
ii)falhas de iluminação: 0,5 pt. por falha

## Referências

* WebGL Beginner's Guide, Diego Cantor, Brandon Jones, June 2012