WITH
    VENDA AS (
        SELECT
            M.CODFILIAL,
            D.DESCRICAO AS DEPARTAMENTO,
            ROUND(SUM(M.QT * M.CUSTOFIN), 2) AS CUSTO,
            ROUND(SUM(M.QT * M.PUNIT), 2) AS VENDA,
            COUNT(DISTINCT M.NUMTRANSVENDA) AS NUMVENDAS,
            ROUND(SUM(M.QT * M.PUNIT) - SUM(M.QT * M.CUSTOFIN), 2) AS LUCRO,
            ROUND(
                SUM(M.QT * M.PUNIT) / COUNT(DISTINCT M.NUMTRANSVENDA),
                2
            ) AS TICKET_MEDIO,
            CASE
                WHEN SUM(M.QT * M.PUNIT) = 0 THEN 0
                ELSE ROUND(
                    (
                        (
                            (SUM(M.QT * M.PUNIT) - SUM(M.QT * M.CUSTOFIN)) * 100
                        ) / SUM(M.QT * M.PUNIT)
                    ),
                    2
                )
            END AS MARGEM
            
        FROM
            PCMOV M, PCDEPTO D
        WHERE
        	M.CODEPTO = D.CODEPTO
             AND M.DTMOV BETWEEN TO_DATE(
	            :datainicio,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
	        AND TO_DATE(
	            :datafim,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
            AND M.CODOPER IN ('S', 'SB')
        GROUP BY
            M.CODFILIAL,
            D.DESCRICAO
        ORDER BY
            M.CODFILIAL
    ),
    META AS (
        SELECT
            PCMETASUP.CODFILIAL,
            SUM(PCMETASUP.VLVENDAPREV) META
        FROM
            PCMETASUP
        WHERE PCMETASUP.DATA BETWEEN TO_DATE(
	            :datainicio,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
	        AND TO_DATE(
	            :datafim,
	            'DD-MON-YYYY',
	            'NLS_DATE_LANGUAGE=ENGLISH'
	        )
	        
        GROUP BY
            PCMETASUP.CODFILIAL
        ORDER BY
            PCMETASUP.CODFILIAL
    )
SELECT
    V.*,
    M.META,
    ROUND((V.VENDA / NULLIF(M.META, 0)) * 100, 2) AS PERCENTUAL_CARREGADO
FROM
    VENDA V
    JOIN META M ON V.CODFILIAL = M.CODFILIAL
ORDER BY
    M.CODFILIAL