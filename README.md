# NeoArgosTools

Este proyecto es una replica de ProGeo-neo, se ha resumido el proceso y se ha actualizado algunas herramientas. Se utlizan las mismas muestras de datos y archivos referencia (genome reference)

Para ejecutar primero se debe descargar los archivos de referencia y secuencias RNA:
- https://drive.google.com/drive/folders/195pHyAZT-kBy0NeLIaBWFyOvtx5qF7zi?usp=sharing

Debe tener un directorio similar a este:

    .


    ├── annovar_out

    ├── outfile1

    ├── outfile2

    ├── reference_files

    └── test

        ├── ms

        └── rna

    ├── 1_neoantigen_detection.py

    ├── 2_optitype.py

    ├── 3_neoantigen_priorization.py



Luego debe tener las siguientes herramientas:
- BWA 0.7.17 
- Samtools 1.19 
- GATK 4.5 
- BCF tools 
- Annovar
- NetMHCpan4.1
- OptiType

Designe una carpeta en su SO para instalar las herramientas.

## BWA
```
git clone https://github.com/lh3/bwa.git
cd bwa; make
```

## Samtools
Descargar de: https://www.htslib.org/download/

Instalar estas dependencias:
```
sudo apt-get install libncurses-dev
sudo apt-get -y install libbz2-dev
sudo apt-get install -y liblzma-dev
```

Descomprimir y dentro de la carpeta de Samtools 
```
./configure --prefix=/where/to/install
make
make install
```

*/where/to/install* es el directorio donde desea tener los archivos ejecutables.  

Vuelva a compilar para que se instale en la carpeta *bin* de ubuntu (esto es necesario para OptiType)
```
./configure 
make
make install
```

## BCFtools

Descargue de https://www.htslib.org/download/

```
./configure --prefix=/where/to/install
make
make install
```

## GATK4

Descargue de: https://github.com/broadinstitute/gatk/releases

GATK requiere java17 y R:

```
sudo apt install openjdk-17-jdk
sudo apt install r-base r-base-dev
```

No es necesario compilar, en la descarga ya estan los binarios

## Annovar

Descargar de https://annovar.openbioinformatics.org/en/latest/user-guide/download/


Una vez descargado, tenemos q descargar las bases de datos para hg38. En el directorio de annovar ejecutar:

```
perl annotate_variation.pl -buildver hg38 -downdb -webfrom annovar refGene humandb/
perl annotate_variation.pl -buildver hg38 -downdb cytoBand humandb/
perl annotate_variation.pl -buildver hg38 -downdb -webfrom annovar exac03 humandb/ 
perl annotate_variation.pl -buildver hg38 -downdb -webfrom annovar avsnp147 humandb/ 
perl annotate_variation.pl -buildver hg38 -downdb -webfrom annovar dbnsfp30a humandb/
```

## NetMHCpan4.1

Descargar de: https://services.healthtech.dtu.dk/services/NetMHCpan-4.1/

Luego editar el archivo *netMHCpan* y agregar la ruta donde se descargo de manera similar a esta:

```
# full path to the NetMHCpan 4.0 directory (mandatory)
setenv	NMHOME	/home/vicente/biotools/netMHCpan-4.1/
```

Tambien modificar la ruta de la carpeta tmp:

```
if ( ${?TMPDIR} == 0 ) then
	setenv  TMPDIR  /home/vicente/biotools/netMHCpan-4.1/tmp
endif
```

## OptiType

Instale HDF5:

```
sudo apt-get build-dep hdf5
```

Tambien necesitamos Razers3. 
```
git clone https://github.com/seqan/seqan.git
mkdir seqan/build; cd seqan/build
cmake .. -DCMAKE_BUILD_TYPE=Release
make razers3
./bin/razers3 --help
```

Instalar estas librerías de Python (de preferencia usar anaconda):

```
pip install numpy
pip install pyomo
pip install pysam
pip install matplotlib

pip install tables
pip install pandas
pip install future

conda install -c conda-forge glpk
```

Luego descargamos OptiType:
```
git clone https://github.com/FRED-2/OptiType.git
```

y creamos un archivo *config.ini* (tomamos como plantilla el archivo *config.ini.example*). En este archivo de configuración debemos especificar la ruta de Razers3, lo abrimos y editamos. Por ejemplo debería quedar similar a esto:

```
# Absolute path to RazerS3 binary, and number of threads to use for mapping

razers3=/home/vicente/biotools/seqan/build/bin/razers3
```


# Uso de NeoArgosTools

Solo ejecute en este orden los scripts:

- 1_neoantigen_detection.py
- 2_optitype.py
- 3_neoantigen_priorization.py


IMPORTANTE, antes debe descomentar las invocaciones a funciones y comandos de cada script. Se recomienda descomentar cada paso uno a uno y verificar las salidas. Por ejemplo, para el script *1_neoantigen_detection.py*:

```
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
```





Al finalizar la ejecución de los 3 scripts se va a generar el achivo *outfile2/candid-neoantigen.txt*. Este contiene los neoantígenos.

Queda pendiente actualizar la función *netMHCpan()* del script *3_neoantigen_priorization.py*. Esta función debe leer la salida de optitype que debería estar en: *test/rna/xxxx*. El script *2_optitype.py* genera ahí la salida con información de los tipos de HLA. Entonces la función *netMHCpan()* debería leer esa salida y utilizarzo antes de invocar a netMHCpan4.1.