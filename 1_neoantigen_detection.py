# este es un script que resume el pipeline de ProGeo-neo
# author: Vicente Machaca Arceda

""" tools
- BWA 0.7.17 
- Samtools 1.19 
- GATK 4.5 
- BCF tools 
- Annovar
"""

"""
========= BWA (https://github.com/lh3/bwa)
git clone https://github.com/lh3/bwa.git
cd bwa; make

========= samtools (https://www.htslib.org/download/)
sudo apt-get install libncurses-dev
sudo apt-get -y install libbz2-dev
sudo apt-get install -y liblzma-dev

luego;
./configure --prefix=/where/to/install
make
make install

========= bcftools (https://www.htslib.org/download/)
./configure --prefix=/where/to/install
make
make install

========= GATK4 (https://github.com/broadinstitute/gatk/releases)
sudo apt install openjdk-17-jdk
sudo apt install r-base r-base-dev

No se compila, solo se llama al binario


========= Annovar (https://annovar.openbioinformatics.org/en/latest/user-guide/download/)

Una vez descargado, tenemos q descargar las bases de datos para hg38.
En el directorio de annovar ejecutar:

perl annotate_variation.pl -buildver hg38 -downdb -webfrom annovar refGene humandb/
perl annotate_variation.pl -buildver hg38 -downdb cytoBand humandb/
perl annotate_variation.pl -buildver hg38 -downdb -webfrom annovar exac03 humandb/ 
perl annotate_variation.pl -buildver hg38 -downdb -webfrom annovar avsnp147 humandb/ 
perl annotate_variation.pl -buildver hg38 -downdb -webfrom annovar dbnsfp30a humandb/
"""


import sys
import os

RNAseqs = ["test/rna/rnaseq-sample1_1.fastq", "test/rna/rnaseq-sample1_2.fastq"]
path_tools = "/home/vicente/biotools/"

# ==========================================================================
# Mapping and alignment 
# ==========================================================================

# index (10GB memory and 36 min on i7-16cpu)
cmd_index = f"{path_tools}/bwa/bwa index reference_files/hg38.fasta"

# mapping (15 GB memory and 6 min)
cmd_map = f'{path_tools}/bwa/bwa mem -t 8 -R "@RG\\tID:foo\\tSM:bar\\tLB:library1" reference_files/hg38.fasta {RNAseqs[0]} {RNAseqs[1]} > outfile1/sample.sam'

# ==========================================================================
# Alignment manipulation 
# ===========================================================================
# Se us samtools para manipular archivos de alineamiento SAM y BAM, tambine permite crear indices para leer regiones rapidamente

# samtools (9 GB memory and 2 min). fixmate fill in information (insert size, cigar, mapq) about paired end reads onto the corresponding other read
cmd_samtools_fixmate = f'{path_tools}/samtools/bin/samtools fixmate -O bam outfile1/sample.sam outfile1/sample.bam'

# samtools (9 GB memory and 2 min), ordena para que las lecturas sean mas rapidas
cmd_samtools_sort = f'{path_tools}/samtools/bin/samtools sort -O bam -o outfile1/sorted_sample.bam -T  temp outfile1/sample.bam' 

# ==========================================================================
# GATK
# ===========================================================================
# Mejora la calidad de los alineamientos

# MarkDuplicates (9 GB memory and 1.57 minutes) -> Identifies and mark duplicate reads
cmd_gatk_markd = f'{path_tools}/gatk-4.5.0.0/gatk MarkDuplicates -I outfile1/sorted_sample.bam -O outfile1/sorted_markedup.bam -M outfile1/sorted_markedup_metric.bam'

# AddOrReplaceReadGroups (9 GB memory and 0.64 minutes) -> Identifies and maark duplicate reads
cmd_gatk_ARgroups = f'{path_tools}/gatk-4.5.0.0/gatk AddOrReplaceReadGroups -I  outfile1/sorted_markedup.bam -O  outfile1/sorted_markedup_Add.bam -ID 4 -LB lib1 -PL illumina -PU unit1 -SM Cancer' 

# BaseRecalibrator (9 GB memory and 4 minutes) ->  Improves the accuracy of our variant calls. Genera la tabla Base Quality Score Recalibration (BQSR)
cmd_gatk_recalibrator = f'{path_tools}/gatk-4.5.0.0/gatk BaseRecalibrator -I outfile1/sorted_markedup_Add.bam  -R  reference_files/hg38.fasta  --known-sites  reference_files/dbsnp_146.hg38.vcf -O outfile1/recal_data-sample.table' 

# ApplyBQSR (9 GB memory and 2.3 minutes) ->  This tool performs the second pass in a two-stage process called Base Quality Score Recalibration (BQSR). 
cmd_gatk_BQSR = f'{path_tools}/gatk-4.5.0.0/gatk ApplyBQSR -R  reference_files/hg38.fasta -I  outfile1/sorted_markedup_Add.bam --bqsr-recal-file  outfile1/recal_data-sample.table -O  outfile1/recal-sample.bam'

# Samtools create index (9 GB memory and 1 minutes)
cmd_samtools_index = f'{path_tools}/samtools/bin/samtools index  outfile1/recal-sample.bam '


# ==========================================================================
# Variant Calling File
# ===========================================================================

# bcftools (9 GB memory and 5 minutes) call for variant calling from the output of the samtools mpileup command.
cmd_vcf_mpileup = f'{path_tools}/bcftools/bin/bcftools mpileup -Ou -f reference_files/hg38.fasta outfile1/recal-sample.bam | {path_tools}/bcftools/bin/bcftools call -vmO z -o  outfile1/sample.vcf.gz'

# bcftools (9 GB memory and 0 minutes) crea el indice  .tbi
cmd_vcf_tabix = f'{path_tools}/bcftools/bin/bcftools tabix -p vcf outfile1/sample.vcf.gz'

# bcftools (9 GB memory and 0 minutes) filtra por calidad
cmd_vcf_filter = f"{path_tools}/bcftools/bin/bcftools filter -O z -o outfile1/sample.filtered.vcf.gz -s LOWQUAL -i 'QUAL>20' outfile1/sample.vcf.gz"

cmd_vcf_unzip = f'gunzip outfile1/sample.filtered.vcf.gz'


# ==========================================================================
# Annovar
# ===========================================================================

cmd_annovar = f'perl {path_tools}/annovar/table_annovar.pl outfile1/sample.filtered.vcf {path_tools}/annovar/humandb/ -buildver hg38 -out annovar_out/annovar -remove -protocol refGene,cytoBand,exac03,avsnp147,dbnsfp30a -operation g,r,f,f,f -nastring . -vcfinput'

# extrae las mutaciones non-synonnymous SNV xq estas si generan cambios en las proteínas.
def nonsynonnymousSNV():
    input1=open('annovar_out/annovar.hg38_multianno.txt','r')
    output1=open("outfile1/sample-nonsynonymous-SNV.txt","w")
    for line in input1:
       ls1=line.strip().split("\t")
       if ls1[8]=='nonsynonymous SNV':
           ls2=ls1[9].strip('"').split(',')
           if len(ls2) >=2:
               for i in range(len(ls2)):
                    output1.write(ls2[i]+'\n')
                #ls3=ls2[i].split(':')
           else:
               output1.write(ls1[9]+'\n')

# extrae el nombre del gen y la secuencia de la base de datos de uniprot.fasta
def readUniProt():
    input1=open('reference_files/uniprot.fasta','r')
    output=open('outfile1/reuniprot.fasta','w')
    a=''
    b=''
    for line in input1:    
        if '>' in line:
            if a !='':
                output.write(a+'\n')      
            b=line.split('|')[2].split('_')[0]  
            c= line.split(' ')
            d=c[-3].split('=')
        #if 
            e=d[1]
        #print e 
            output.write(b+'\t'+e+'\t')
            a=''
        else:
            a+=line.strip()
    output.write(a+'\n')

# buscar los mutaciones nonsynonnymous en UniProt
def nonsynonnymousSNV_in_uniprot():
    input1=open("outfile1/reuniprot.fasta","r")
    input2=open("outfile1/sample-nonsynonymous-SNV.txt","r")
    output1=open("outfile1/candidate_match_proSeq.txt","w")
    dict1={}
    dict2={}
    # crea un diccionario con la infpormacion de UniProt. 
    # la llave es el noombre de gen y el valor la seq
    for line in input1:
        ls1=line.strip().split("\t")
        dict1[ls1[0]]=ls1[2]
        dict2[ls1[1]]=ls1[2]
    
    for line1 in input2:
        ls2=line1.strip().split(":")
    
        #if dict1.has_key(ls2[0]) or dict1.has_key(ls2[1]):
        if (ls2[0] in dict1.keys()) or (ls2[1] in dict1.keys()):
            output1.write(ls2[0]+"\t"+ls2[4]+"\t"+dict1[ls2[0]]+"\n")
        else:
            pass   

# quita los repetidos
def unique_filter():
    lines_seen=set()
    outfile = open("outfile1/match_proSeq.txt","w")
    for line in open("outfile1/candidate_match_proSeq.txt","r"):
        if line not in lines_seen:
            outfile.write(line)
            lines_seen.add(line)
    outfile.close()

def to_fasta():
    input1=open("outfile1/match_proSeq.txt","r")
    output1=open("var-proSeq.fasta","w")
    for line in input1:
        ls1=line.strip().split("\t")
        ls2=ls1[1].split('.')
        ls3=ls2[1][0]
        ls4=ls2[1][-1]
        ls5=ls2[1][1:-1]
        ls6=int(ls5)-1
        ls7=list(ls1[2])
        if len(ls1[2]) >= int(ls2[1][1:-1]):   
            if ls7[ls6] == ls2[1][0]:
                ls7[ls6]=ls2[1][-1]
                seq="".join(ls7)
                output1.write(">"+ls1[0]+'|'+ls1[1]+'\n'+seq+'\n')

# =================================================
# descomentar uno a uno para evaluar el pipeline
# =================================================

#os.system(cmd_index)
#os.system(cmd_map)
#os.system(cmd_samtools_fixmate)
#os.system(cmd_samtools_sort)
#os.system(cmd_gatk_markd)
#os.system(cmd_gatk_ARgroups)
#os.system(cmd_gatk_recalibrator)
#os.system(cmd_gatk_BQSR)
#os.system(cmd_samtools_index)
#os.system(cmd_vcf_mpileup)
#os.system(cmd_vcf_tabix)
#os.system(cmd_vcf_filter)
#os.system(cmd_vcf_unzip)
#os.system(cmd_annovar)
#nonsynonnymousSNV()
#readUniProt()
#nonsynonnymousSNV_in_uniprot()
#unique_filter()
to_fasta()