## Objetivo

### Parte Geral

Implementar o método de visualização de objetos triangulados, através do
algoritmo de conversão por varredura, com métodos de interpolação de Phong, com a
visibilidade garantida pelo algoritmo do “z-buffer”.

### Parte Específica

Implementar o método de visualização de objetos triangulados utilizando uma equação de iluminação de Phong por triângulo (Flat Shading).

## Descrição

O usuário, através de arquivos-texto ou interface gráfica, entra com a quantidade de objetos, e na sequência,
os dados dos objetos, os atributos dos objetos (para cada um, ka, kd e ks, pontos flutuantes entre 0 e 1, h, ponto
flutuante positivo e Od, tripla de pontos flutuantes entre 0 e 1), atributos da cena (Ia, IL, triplas de ponto flutuante
entre 0 e 255, PL, tripla de ponto flutuante) e os atributos da câmera virtual (C, N e V, triplas de pontos flutuantes,
d, hx, e hy, pontos flutuantes positivos). O seu sistema começa preparando a câmera, ortogonalizando V e gerando U,
e depois os normalizando, fazer a mudança de coordenadas para o sistema de vista de todos os vértices dos objetos e da
posição da fonte de luz PL, gerar as normais dos triângulos.

Ordenam-se os triângulos do objeto segundo a distância dos seus baricentros para a origem, do mais distante para o mais próximo.

Para cada triângulo na lista ordenada, e tomando-se o baricentro como referência, calculam-se também os demais vetores
da equação de iluminação: L, V e R e os substitui na equação do modelo de iluminação de Phong produzindo a cor do triângulo.

calculam-se as projeções dos seus vértices e inicia-se a sua conversão por varredura (scanline) pintando todos os pixels
do triângulo  com a cor calculada.

## Observações

Alguns arquivos de objetos serão providos. O padrão do arquivo deve ser o dos que
serão providos. O sistema deve poder aceitar a troca dos objetos sem necessariamente ser
reinicializado. O seu sistema deve tratar de casos especiais de posições relativas de fonte de
luz, câmera e ponto a ser observado no objeto.
Esteja preparado para modificar o código no momento da apresentação. A
modificação a ser feita será divulgada no momento da apresentação, e todos os
componentes serão convocados. As notas poderão ser diferentes, dependendo do
desempenho na modificação. Tipicamente, os decrementos na nota por erros no sistema
são: i)falhas em seguir a especificação, estouro de memória na execução repetida, falhas de
ordem geométrica, falhas de modelo: 1 pt. por falha; ii)falhas de iluminação: 0,5 pt. por
falha