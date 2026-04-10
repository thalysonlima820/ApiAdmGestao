WITH EXPLOSAO AS (
SELECT PCMOV.CODPROD,                                                      
       PCPRODUT.DESCRICAO,                                                                      
       PCMOV.NUMTRANSENT, 
       PCMOV.CODFILIAL,
       SUM(NVL(PCMOV.QT, 0)) AS QT                                                
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
       PCPRODUT.DESCRICAO,
       PCMOV.CODFILIAL,
       PCMOV.NUMTRANSENT                                                                   
 ORDER BY PCMOV.CODPROD                                                     
),
ENTRADA AS (
SELECT 
    P.CODPROD, 
SUM(M.QT) AS TOTAL_QT
FROM PCMOV M
JOIN PCPRODUT P 
    ON M.CODPROD = P.CODPROD
JOIN PCEST E 
    ON M.CODPROD = E.CODPROD 
   AND M.CODFILIAL = E.CODFILIAL 
WHERE M.DTMOV BETWEEN TO_DATE(:datainicio,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
                  AND TO_DATE(:datafim,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
  AND P.TIPOMERC = 'BC'
  AND P.CODEPTO = 17
  AND M.CODFILIAL = :filial 
  AND M.CODOPER IN ('SP')
GROUP BY  P.CODPROD
),
ENTRADA_MERCADORIA AS (
SELECT 
    P.CODPROD, 
SUM(
        CASE
            WHEN M.CODOPER = 'E' AND M.QT < 0 THEN -ABS(M.QT)
            ELSE M.QT
        END
    ) AS QT_ENTRADA_MERCADOPRIA
FROM PCMOV M
JOIN PCPRODUT P 
    ON M.CODPROD = P.CODPROD
JOIN PCEST E 
    ON M.CODPROD = E.CODPROD 
   AND M.CODFILIAL = E.CODFILIAL 
WHERE M.DTMOV BETWEEN TO_DATE(:datainicio,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
                  AND TO_DATE(:datafim,'DD-MON-YYYY','NLS_DATE_LANGUAGE=ENGLISH')
  AND P.TIPOMERC = 'BC'
  AND P.CODEPTO = 17
  AND M.CODFILIAL = 2
  AND M.CODOPER IN ('E')
GROUP BY  
    P.CODPROD, 
    P.DESCRICAO, 
    M.CODOPER,
    E.QTESTGER 
)
SELECT 
    B.CODPRODACAB AS CODPRODUTO_QUARTO, 
    PP.DESCRICAO AS QUARTO,

    SUM(CASE 
          WHEN S.CODPROD <> 21668 THEN S.QT 
          ELSE 0 
        END) AS QT_APROVEITADO,

    NVL((
        SELECT SUM(SD.QT)
        FROM EXPLOSAO SD
        WHERE SD.CODPROD = 21668
          AND SD.NUMTRANSENT = S.NUMTRANSENT
          AND SD.CODFILIAL = S.CODFILIAL
    ), 0) AS QT_DESCARTE,

    SUM(CASE 
          WHEN S.CODPROD <> 21668 THEN S.QT 
          ELSE 0 
        END)
    +
    NVL((
        SELECT SUM(SD.QT)
        FROM EXPLOSAO SD
        WHERE SD.CODPROD = 21668
          AND SD.NUMTRANSENT = S.NUMTRANSENT
          AND SD.CODFILIAL = S.CODFILIAL
    ), 0) AS TOTAL_GERAL,

    ROUND(
        (
            NVL((
                SELECT SUM(SD.QT)
                FROM EXPLOSAO SD
                WHERE SD.CODPROD = 21668
                  AND SD.NUMTRANSENT = S.NUMTRANSENT
                  AND SD.CODFILIAL = S.CODFILIAL
            ), 0)
            /
            NULLIF(
                SUM(CASE 
                      WHEN S.CODPROD <> 21668 THEN S.QT 
                      ELSE 0 
                    END)
                +
                NVL((
                    SELECT SUM(SD.QT)
                    FROM EXPLOSAO SD
                    WHERE SD.CODPROD = 21668
                      AND SD.NUMTRANSENT = S.NUMTRANSENT
                      AND SD.CODFILIAL = S.CODFILIAL
                ), 0),
                0
            )
        ) * 100,
        2
    ) AS PERC_DESCARTE,

    ROUND(
        (
            SUM(CASE 
                  WHEN S.CODPROD <> 21668 THEN S.QT 
                  ELSE 0 
                END)
            /
            NULLIF(
                SUM(CASE 
                      WHEN S.CODPROD <> 21668 THEN S.QT 
                      ELSE 0 
                    END)
                +
                NVL((
                    SELECT SUM(SD.QT)
                    FROM EXPLOSAO SD
                    WHERE SD.CODPROD = 21668
                      AND SD.NUMTRANSENT = S.NUMTRANSENT
                      AND SD.CODFILIAL = S.CODFILIAL
                ), 0),
                0
            )
        ) * 100,
        2
    ) AS PERC_APROVEITADO,

    E.QTESTGER AS ESTOQUE,
    EM.QT_ENTRADA_MERCADOPRIA

FROM EXPLOSAO S
JOIN PCFORMPROD B 
    ON S.CODPROD = B.CODPRODMP
JOIN ENTRADA EE 
    ON B.CODPRODACAB = EE.CODPROD
JOIN PCPRODUT PP 
    ON B.CODPRODACAB = PP.CODPROD 
JOIN PCEST E 
    ON B.CODPRODACAB = E.CODPROD 
   AND S.CODFILIAL = E.CODFILIAL 
JOIN ENTRADA_MERCADORIA EM
	ON B.CODPRODACAB = EM.CODPROD

WHERE 1=1
  AND PP.TIPOMERC = 'BC'
  AND S.CODPROD <> 21668

GROUP BY 
    B.CODPRODACAB,
    PP.DESCRICAO,
    E.QTESTGER,
    S.NUMTRANSENT,
    S.CODFILIAL,
    EM.QT_ENTRADA_MERCADOPRIA

ORDER BY 
    B.CODPRODACAB