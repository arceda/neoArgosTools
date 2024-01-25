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