WITH ENTRADA AS (
SELECT PCMOV.CODPROD,                                                                                                                       
       SUM(NVL(PCMOV.QT, 0)) AS QT_ENRTADA                                                
  FROM PCMOV, PCPRODUT, PCDEPTO, PCSECAO, PCEMPR                                                
 WHERE PCMOV.DTMOV 
 BETWEEN TO_DATE(:datainicio,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
        AND TO_DATE(:datafim,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
   AND PCMOV.CODOPER = 'EP'                                                                   
   AND PCMOV.STATUS IN ('B', 'AB')                                                          
   AND PCMOV.CODFUNCLANC = PCEMPR.MATRICULA(+)                                                  
   AND  PCMOV.CODFILIAL = :filial                                                           
   AND PCPRODUT.CODEPTO = PCDEPTO.CODEPTO                                                       
   AND PCPRODUT.CODSEC = PCSECAO.CODSEC                                                         
   AND PCMOV.CODPROD = PCPRODUT.CODPROD                                                         
 GROUP BY PCMOV.CODPROD,                                                      
       PCPRODUT.DESCRICAO                                                                 
 ORDER BY PCMOV.CODPROD   
),
GERAL AS (
SELECT 
    P.CODPROD,
    B.CODAUXILIAR,
    COALESCE(B.DESCRICAOECF, P.DESCRICAO) AS PRODUTO,
    E.QTESTGER AS ESTOQUE,
    NVL(SUM(M.QT), 0) AS QT_SAIDA,
    B.PVENDA AS PRECO,
    E.CUSTOULTENT AS CUSTO,
    NVL(SUM(M.QT * B.PVENDA), 0) AS VL_VENDA
FROM PCEMBALAGEM B
JOIN PCPRODUT P 
    ON B.CODPROD = P.CODPROD 
JOIN PCEST E 
    ON B.CODPROD = E.CODPROD 
   AND B.CODFILIAL = E.CODFILIAL 
LEFT JOIN PCMOV M 
    ON B.CODPROD = M.CODPROD 
   AND B.CODFILIAL = M.CODFILIAL
   AND B.CODAUXILIAR = M.CODAUXILIAR
   AND M.DTMOV BETWEEN TO_DATE(:datainicio,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH') 
                   AND TO_DATE(:datafim,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
   AND M.CODOPER = 'S'
WHERE B.CODFILIAL = :filial
GROUP BY  
    P.CODPROD,
    B.CODAUXILIAR,
    B.DESCRICAOECF, 
    P.DESCRICAO,
    E.QTESTGER,
    E.CUSTOULTENT,
    B.PVENDA
ORDER BY B.CODAUXILIAR
)
 
SELECT 
	 G.CODPROD,
	 P.DESCRICAO AS PRODUTO_MASTER,
	 G.CODAUXILIAR,
	 G.PRODUTO,
	 E.QT_ENRTADA,
	 G.QT_SAIDA,
	 G.CUSTO,
	 G.PRECO,
	 G.ESTOQUE,
	 G.VL_VENDA,
	 ROUND(((G.PRECO - G.CUSTO) / G.PRECO) * 100, 2) AS MARGEM
FROM ENTRADA E
JOIN GERAL G ON E.CODPROD = G.CODPROD
JOIN PCPRODUT P ON E.CODPROD = P.CODPROD