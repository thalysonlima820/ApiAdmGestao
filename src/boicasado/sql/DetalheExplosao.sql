WITH EXPLOSAO AS (
SELECT PCMOV.CODPROD,                                                      
       PCPRODUT.DESCRICAO,                                                                      
       PCMOV.NUMTRANSENT,                                                           
       SUM(NVL(PCMOV.QT, 0)) AS QT                                                
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
       PCPRODUT.DESCRICAO,                                                                      
       PCMOV.NUMTRANSENT                                                                   
 ORDER BY PCMOV.CODPROD                                                     
)

SELECT 
	B.CODPRODACAB AS CODPRODUTO_QUARTO, 
	PP.DESCRICAO AS QUARTO,
	S.CODPROD, 
	S.DESCRICAO, 
	SUM(S.QT) AS qt,
	SUM(SUM(S.QT)) OVER () AS TOTAL_GERAL
FROM EXPLOSAO S
JOIN PCFORMPROD B ON S.CODPROD = B.CODPRODMP
JOIN PCPRODUT PP ON B.CODPRODACAB = PP.CODPROD 
WHERE B.CODPRODACAB = 26790
AND S.NUMTRANSENT IN (280913)
GROUP BY 
B.CODPRODACAB, S.CODPROD,PP.DESCRICAO, S.DESCRICAO
ORDER BY S.CODPROD