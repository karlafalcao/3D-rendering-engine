"use strict";

function FlatShading() {
    function init() {
        //TODO Get the list of points
        //TODO Get the list of triangles
        //TODO Calibrate the camera (U = NxV)
        // O seu sistema começa preparando a câmera, ortogonalizando V e gerando U, e depois os normalizando
        //TODO Converter todas as coordenadas para vista (projecao)
        // Fazer a mudança de coordenadas para o sistema de vista de todos os vértices dos objetos e da
        // posição da fonte de luz PL, gerar as normais dos triângulos.
        //TODO Calcula normais dos triangulos (call triangleNormalVector)
        //	Ordenam-se os triângulos do objeto segundo a distância dos seus baricentros para a origem, do mais distante para o mais próximo.
        //  Para que se faça a conversão do mais distante primeiro (Zbuffer)
        //TODO Calcula normais nos vertices
        //TODO Inicialização z-buffer
        //TODO - Para cada triangulo
        // Para cada triângulo na lista ordenada, e tomando-se o baricentro como referência, calculam-se também os demais vetores
        // da equação de iluminação: L, V e R e os substitui na equação do modelo de iluminação de Phong produzindo a cor do triângulo.
        //TODO -- Algoritmo Scan conversion
        //	Calculam-se as projeções dos seus vértices e inicia-se a sua conversão por varredura (scanline) pintando todos os pixels
        // do triângulo  com a cor calculada.
        //TODO --- Para cada pixel -> encontre suas coordenadas baricentricas P` = alfa*P`1+beta*P`2+gama*P3
        //TODO --- Para cada pixel -> encontre ponto no mundo 3d : P = alfa*P1+beta*P2+gama*P3
        //TODO --- Para cada pixel -> Consulte z-buffer, se Px < zbuffer[Px, Py];
        //TODO --- Para cada pixel -> Equacao de iluminacao N = alfa*N1+beta*N2+gama*N3
        //TODO --- Para cada pixel -> Encontre R e V e normalize
        //TODO --- Para cada pixel -> Jogar na equacao de iluminacao
        //TODO --- Para cada pixel -> Checar se N está no mesmo sentido de V (norma do triangulo)
        //TODO --- Para cada pixel -> Se N.V < 0 entao muda o sinal de V (N=-N);
        //TODO --- Para cada pixel -> Se N.L < 0 entao so componente ambiental;
        //TODO --- Para cada pixel -> Se V.R < 0 entao tem especular;
    }

    function triangleNormalVector(p1, p2, p3){
        var v1,
        v2,
        n,
        len;

        /* Encontra vetor v1 */
        v1 = p2.sub(p1);
        /* Encontra vetor v2 */
        v2 = p3.sub(p1);

        /* Calculo do produto vetorial de v1 e v2 */
        n = v1.crossProduct(v2);

        /* normalizacao de n */
        n = n.norm();
    }
}