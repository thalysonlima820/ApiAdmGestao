
WITH ENTRADA AS (
	SELECT PCMOV.CODPROD,                                                      
	       PCPRODUT.DESCRICAO,                  SUM(NVL(PCMOV.QT, 0)) AS QT_ENTRADA                                               
	  FROM PCMOV, PCPRODUT, PCDEPTO, PCSECAO, PCEMPR                                                
	 WHERE PCMOV.DTMOV 
	 BETWEEN TO_DATE(:datainicio,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
	        AND TO_DATE(:datafim,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
	   AND PCMOV.CODOPER = 'EP'                                                                   
	   AND PCMOV.STATUS IN ('B', 'AB')                                                          
	   AND PCMOV.CODFUNCLANC = PCEMPR.MATRICULA(+)                                                  
	   AND PCMOV.CODFILIAL = :filial                                                           
	   AND PCPRODUT.CODEPTO = PCDEPTO.CODEPTO                                                       
	   AND PCPRODUT.CODSEC = PCSECAO.CODSEC                                                         
	   AND PCMOV.CODPROD = PCPRODUT.CODPROD  
	 GROUP BY PCMOV.CODPROD,                                                      
	       PCPRODUT.DESCRICAO                                                              
	 ORDER BY PCMOV.CODPROD 
),
SAIDA AS (
	SELECT M.CODPROD, SUM(NVL(M.QT, 0)) AS QT_SAIDA
	FROM PCMOV M
	WHERE M.DTMOV BETWEEN TO_DATE(:datainicio,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH') 
		AND TO_DATE(:datafim,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
	AND M.CODOPER = 'S'
	AND M.CODFILIAL = :filial 
	AND M.CODEPTO = 17
	GROUP BY M.CODPROD
)

SELECT E.CODPROD, E.DESCRICAO, E.QT_ENTRADA, S.QT_SAIDA, (E.QT_ENTRADA - S.QT_SAIDA) AS GERAL
FROM ENTRADA E
LEFT JOIN SAIDA S ON E.CODPROD = S.CODPROD

