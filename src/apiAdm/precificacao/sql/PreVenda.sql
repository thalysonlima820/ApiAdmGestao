WITH TBLAUXILIAR AS (
    SELECT
        PCITEM.ROWID RID,
        NVL(PCPEDIDO.IMPORTACAO, 'N') IMPORTACAO,
        DECODE(
            NVL(
                PCITEM.TIPOEMBALAGEMPEDIDO,
                NVL(PCPEDIDO.TIPOEMBALAGEMPEDIDO, 'V')
            ),
            'V',
            1,
            DECODE(
                NVL(PCPRODUT.QTUNITCX, 0),
                0,
                1,
                PCPRODUT.QTUNITCX
            )
        ) QTUNITCX,
        DECODE(
            NVL(PCPEDIDO.IMPORTACAO, 'N'),
            'S',
            DECODE(NVL(PCPEDIDO.COTACAO, 0), 0, 1, PCPEDIDO.COTACAO),
            1
        ) COTACAO,
        (
            CASE
                WHEN (
                    (
                        NVL(
                            PARAMFILIAL.OBTERCOMOVARCHAR2('CON_USAPERCDIFQTENT'),
                            'N'
                        ) = 'S'
                    )
                    AND (NVL(PCPRODUT.USACLASSIFICACAO, 'N') <> 'S')
                    AND (NVL(PCPRODUT.UNIDADE, 'UN') IN ('KG', 'GR', 'G'))
                ) THEN (
                    PARAMFILIAL.OBTERCOMONUMBER('CON_PERCDIFQTENT') * 0.01
                )
                ELSE 0
            END
        ) FATORMARGEM
    FROM
        PCPEDIDO,
        PCITEM,
        PCPRODUT
    WHERE
        PCPEDIDO.NUMPED = PCITEM.NUMPED
        AND PCITEM.CODPROD = PCPRODUT.CODPROD
        AND EXISTS(
            SELECT
                1
            FROM
                PCMOVPREENT MOV
            WHERE
                MOV.NUMPED = PCITEM.NUMPED
                AND MOV.CODPROD = PCITEM.CODPROD
        )
    GROUP BY
        PCITEM.ROWID,
        PCPRODUT.USACLASSIFICACAO,
        PCPRODUT.UNIDADE,
        PCPEDIDO.TIPOEMBALAGEMPEDIDO,
        PCITEM.TIPOEMBALAGEMPEDIDO,
        PCPRODUT.QTUNITCX,
        PCPEDIDO.IMPORTACAO,
        PCPEDIDO.COTACAO
),
PVT AS (
    SELECT
        P.CODPROD,
        M.CODFILIAL,
        SM.MARKUP AS MARKUP_NUMERO,
        CONCAT(NVL(SM.MARKUP, 40), '%') AS MARKUP,
        ROW_NUMBER() OVER (
            PARTITION BY M.CODFILIAL,
            P.CODPROD
            ORDER BY
                M.DTMOV DESC
        ) AS RN
    FROM
        PCPRODUT P
        JOIN PCSECAO S ON P.CODSEC = S.CODSEC -- Relaciona com a seção
        JOIN PCMOV M ON P.CODPROD = M.CODPROD -- Relaciona com o movimento
        LEFT JOIN SITEMARKUP SM ON P.CODSEC = SM.CODSEC
        AND P.CLASSEVENDA = SM.CURVA -- Relaciona markup com classe de venda e seção
    WHERE
        M.CODOPER = 'E' -- Somente entradas
        AND M.DTMOV > TO_DATE('01-JAN-2023', 'DD-MM-YYYY')
),
ULTIMA_ENTRADA AS (
    SELECT
        M.CODFORNEC,
        M.VALORULTENT AS VALOR_ULTIMA_ENTRADA,
        M.CODFILIAL AS CODIGO_FILIAL,
        M.CODPROD AS COD_PRODUTO,
        ROW_NUMBER() OVER (
            PARTITION BY M.CODFILIAL,
            M.CODPROD
            ORDER BY
                M.DTMOV DESC
        ) AS RN
    FROM
        PCMOV M,
        PCPEDIDO P
    WHERE
        M.NUMPED = P.NUMPED
        AND M.DTMOV > TO_DATE('01-JAN-2025', 'DD-MM-YYYY')
        AND M.CODOPER IN ('E', 'EB')
        AND P.TIPOBONIFIC IN ('N', 'B')
),
FINAL AS (
    SELECT
        PCNFENTPREENT.CODFILIAL AS CODIGO_FILIAL,
        PCMOVPREENT.NUMNOTA,
        D.DESCRICAO AS DEPARTAMENTO,
        F.FORNECEDOR,
        PCMOVPREENT.NUMPED,
        U.MATRICULA AS CODCOMPRADOR,
        U.NOME,
        PCMOVPREENT.CODPROD AS COD_PRODUTO,
        PCPRODUT.DESCRICAO AS PRODUTO,
        PCPRODUT.CODAUXILIAR,
        PCPRODUT.CLASSEVENDA,
        PCNFENTPREENT.DTEMISSAO AS DATA_ULTIMA_ENTRADA,
        PCPRODUT.NBM CODNCM,
        B.MARGEM AS MARGEM_IDEAL,
        ROUND((PCMOVPREENT.PUNIT), 2) AS CUSTO,
        ROUND(
            (
                (
                    (B.PVENDA - C.VALOR_ULTIMA_ENTRADA) / NULLIF(B.PVENDA, 0)
                ) * 100
            ),
            2
        ) AS MARGEM_ATUAL,
        B.PVENDA AS VL_VENDA,
        PVT.MARKUP,
        ROUND(
            PCMOVPREENT.PUNIT + (
                PCMOVPREENT.PUNIT * NVL(PVT.MARKUP_NUMERO, 40) / 100
            ),
            2
        ) AS PRECOMINSUG,
        ROUND(
            (
                (
                    (
                        PCMOVPREENT.PUNIT + (
                            PCMOVPREENT.PUNIT * NVL(PVT.MARKUP_NUMERO, 40) / 100
                        )
                    ) - PCMOVPREENT.PUNIT
                ) / PVT.MARKUP_NUMERO
            ) * 100,
            2
        ) AS MARGEM_FUTURA_WTH,
        ROUND((C.VALOR_ULTIMA_ENTRADA), 2) AS VALOR_ULTIMA_ENTRADA,
        PCPRODUT.EMBALAGEM,
        DECODE(
            NVL(PCPRODUT.QTUNITCX, 0),
            0,
            1,
            PCPRODUT.QTUNITCX
        ) QTUNITCX,
        PCPEDIDO.DTEMISSAO DTPEDIDO,
        NVL(PCMOVPREENT.QT, 0) QT,
        (NVL(PCITEM.QTPEDIDA, 0) / TBLAUXILIAR.QTUNITCX) QTPEDIDA,
        NVL(PCMOVPREENT.PERCICM, 0) PERCICMSENT,
        NVL(PCITEM.PERICM, 0) PERCICMSPED,
        NVL(PCMOVPREENT.PERPIS, 0) PERCPISENT,
        NVL(PCITEM.PERPIS, 0) PERCPISPED,
        NVL(PCMOVPREENT.PERCOFINS, 0) PERCCOFINSENT,
        NVL(PCITEM.PERCOFINS, 0) PERCCOFINSPED
    FROM
        PCMOVPREENT,
        PCMOVCOMPLEPREENT,
        PCNFENTPREENT,
        PCPRODUT,
        PCPRODFILIAL,
        PCITEM,
        PCPEDIDO,
        TBLAUXILIAR,
        PVT,
        PCPEDIDO PCPEDIDOMASTER,
        PCDEPTO D,
        PCFORNEC F,
        PCEMPR U,
        PCEMBALAGEM B,
        ULTIMA_ENTRADA C
    WHERE
        PCMOVPREENT.CODPROD = PCPRODUT.CODPROD
        AND NVL(PCNFENTPREENT.TIPODESCARGA, '1') IN ('1', '5', 'A', 'N', 'H', 'S', '2')
        AND PCMOVPREENT.NUMTRANSENT = PCNFENTPREENT.NUMTRANSENT
        AND PCMOVPREENT.NUMTRANSITEM = PCMOVCOMPLEPREENT.NUMTRANSITEM
        AND PCPRODUT.CODEPTO = D.CODEPTO
        AND PCMOVPREENT.CODPROD = PCPRODFILIAL.CODPROD
        AND PCPEDIDO.CODFORNEC = F.CODFORNEC
        AND PCPEDIDO.CODCOMPRADOR = U.MATRICULA
        AND PCPRODUT.CODPROD = B.CODPROD
        AND PCPRODUT.CODPROD = PVT.CODPROD
        AND PCNFENTPREENT.CODFILIAL = B.CODFILIAL
        AND PCNFENTPREENT.CODFILIAL = PVT.CODFILIAL
        AND PCNFENTPREENT.CODFILIAL = C.CODIGO_FILIAL
        AND PCPRODUT.CODPROD = C.COD_PRODUTO
        AND PCPEDIDO.CODFORNEC = C.CODFORNEC
        AND PVT.RN = 1
        AND C.RN = 1
        AND PCNFENTPREENT.CODFILIAL = PCPRODFILIAL.CODFILIAL
        AND PCNFENTPREENT.NUMPEDPREENT = PCPEDIDOMASTER.NUMPED(+)
        AND PCMOVPREENT.NUMPED = PCPEDIDO.NUMPED(+)
        AND PCMOVPREENT.NUMPED = PCITEM.NUMPED(+)
        AND PCMOVPREENT.CODPROD = PCITEM.CODPROD(+)
        AND PCMOVPREENT.PRODBONIFICADO = PCITEM.PRODBONIFICADO(+)
        AND PCMOVPREENT.NUMSEQPED = PCITEM.NUMSEQ(+)
        AND PCITEM.ROWID = TBLAUXILIAR.RID(+)
        AND PCMOVPREENT.DTMOV >= TO_DATE(
            :data_entrada,
            'DD-MON-YYYY',
            'NLS_DATE_LANGUAGE=ENGLISH'
        )
        AND PCNFENTPREENT.STATUS = 'L'
        AND (
            (NVL(PCMOVPREENT.QT, 0) > 0)
            OR(NVL(PCMOVPREENT.QTCONT, 0) > 0)
        )
)
SELECT
    *
FROM
    (
        SELECT
            FINAL.*,
            ROW_NUMBER() OVER (
                PARTITION BY CODIGO_FILIAL,
                COD_PRODUTO
                ORDER BY
                    CODIGO_FILIAL
            ) AS rn
        FROM
            FINAL
    )
WHERE
    rn = 1