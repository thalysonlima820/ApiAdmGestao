WITH VENDA AS (
    SELECT
        M.CODFILIAL,
        ROUND(SUM(M.QT * M.CUSTOFIN), 2) AS CUSTO,
        ROUND(SUM(M.QT * M.PUNIT), 2) AS VENDA,
        COUNT(DISTINCT M.NUMTRANSVENDA) AS NUMVENDAS,
        ROUND(SUM(M.QT * M.PUNIT) - SUM(M.QT * M.CUSTOFIN), 2) AS LUCRO,
        ROUND(
            SUM(M.QT * M.PUNIT) / COUNT(DISTINCT M.NUMTRANSVENDA), 2) AS TICKET_MEDIO,
        CASE
            WHEN SUM(M.QT * M.PUNIT) = 0 THEN 0
            ELSE ROUND(
                (
                    (
                        (SUM(M.QT * M.PUNIT) - SUM(M.QT * M.CUSTOFIN)) * 100
                    ) / SUM(M.QT * M.PUNIT)
                ),2
            ) END AS MARGEM
    FROM
        PCMOV M
    WHERE
        M.DTMOV >= TRUNC (SYSDATE, 'MM')
            AND M.DTMOV < ADD_MONTHS (TRUNC (SYSDATE, 'MM'), 1)
        AND M.CODOPER IN ('S', 'SB')
    GROUP BY
        M.CODFILIAL
    ORDER BY
        M.CODFILIAL
),
META AS (
    SELECT
        PCMETASUP.CODFILIAL,
        SUM(PCMETASUP.VLVENDAPREV) META
    FROM
        PCMETASUP
    WHERE
         PCMETASUP.DATA >= TRUNC (SYSDATE, 'MM')
            AND PCMETASUP.DATA < ADD_MONTHS (TRUNC (SYSDATE, 'MM'), 1)
    GROUP BY
        PCMETASUP.CODFILIAL
    ORDER BY
        PCMETASUP.CODFILIAL
),
AVISTA AS (
SELECT SUM(VLTOTAL) AVISTA
        FROM PCPEDCECF
        WHERE DATA >= TRUNC(SYSDATE) - 1
           AND DATA < TRUNC(SYSDATE)
        AND CODCOB IN (
        'VIDE',
        'VDEB',
        'VDSB',
        'VDEC',
        'PXVD',
        'PIXM',
        'PXPB',
        'PIX',
        'SAFR',
        'MDEB',
        'MDPB',
        'MADC',
        'ELDE',
        'EDER',
        'EDPB',
        'ELOD',
        'D',
        'DBVL',
        'ALEE',
        'ALEA',
        'ALPS'
        )

)
SELECT
    V.*,
    M.META,
    ROUND((V.VENDA / NULLIF(M.META, 0)) * 100, 2) AS PERCENTUAL_CARREGADO,
    VS.AVISTA
    
FROM AVISTA VS,
    VENDA V
    JOIN META M ON V.CODFILIAL = M.CODFILIAL